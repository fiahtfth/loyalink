import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, AppError } from "@/lib/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const merchant = await prisma.merchant.findUnique({
      where: { id },
    })

    if (!merchant) {
      throw new AppError("Merchant not found", 404, "MERCHANT_NOT_FOUND")
    }

    const [
      totalTransactions,
      totalRedemptions,
      totalPointsDistributed,
      totalPointsRedeemed,
      totalRevenue,
      recentTransactions,
      topCustomers,
    ] = await Promise.all([
      // Total transactions count
      prisma.transaction.count({
        where: { merchantId: id },
      }),
      // Total redemptions count
      prisma.redemption.count({
        where: { merchantId: id },
      }),
      // Total points distributed
      prisma.transaction.aggregate({
        where: { merchantId: id },
        _sum: { pointsEarned: true },
      }),
      // Total points redeemed at this merchant
      prisma.redemption.aggregate({
        where: { merchantId: id },
        _sum: { pointsUsed: true },
      }),
      // Total revenue
      prisma.transaction.aggregate({
        where: { merchantId: id },
        _sum: { amount: true },
      }),
      // Recent transactions (last 10)
      prisma.transaction.findMany({
        where: { merchantId: id },
        include: {
          customer: {
            select: { name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Top customers by transaction count
      prisma.transaction.groupBy({
        by: ["customerId"],
        where: { merchantId: id },
        _count: { customerId: true },
        _sum: { amount: true, pointsEarned: true },
        orderBy: { _count: { customerId: "desc" } },
        take: 5,
      }),
    ])

    // Get customer details for top customers
    const customerIds = topCustomers.map((c) => c.customerId)
    const customerDetails = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true, phone: true },
    })

    const topCustomersWithDetails = topCustomers.map((tc) => {
      const customer = customerDetails.find((c) => c.id === tc.customerId)
      return {
        customer,
        transactionCount: tc._count.customerId,
        totalSpent: tc._sum.amount || 0,
        totalPointsEarned: tc._sum.pointsEarned || 0,
      }
    })

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        shopName: merchant.shopName,
        category: merchant.category,
        walletBalance: merchant.walletBalance,
        isActive: merchant.isActive,
      },
      stats: {
        totalTransactions,
        totalRedemptions,
        totalPointsDistributed: totalPointsDistributed._sum.pointsEarned || 0,
        totalPointsRedeemed: totalPointsRedeemed._sum.pointsUsed || 0,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageTransactionValue:
          totalTransactions > 0
            ? (totalRevenue._sum.amount || 0) / totalTransactions
            : 0,
      },
      recentTransactions,
      topCustomers: topCustomersWithDetails,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
