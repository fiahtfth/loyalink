import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, AppError } from "@/lib/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params

    const customer = await prisma.customer.findUnique({
      where: { phone },
    })

    if (!customer) {
      throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND")
    }

    const [
      totalTransactions,
      totalRedemptions,
      totalPointsEarned,
      totalPointsRedeemed,
      totalSpent,
      recentTransactions,
      recentRedemptions,
      merchantsVisited,
    ] = await Promise.all([
      // Total transactions count
      prisma.transaction.count({
        where: { customerId: customer.id },
      }),
      // Total redemptions count
      prisma.redemption.count({
        where: { customerId: customer.id },
      }),
      // Total points earned
      prisma.transaction.aggregate({
        where: { customerId: customer.id },
        _sum: { pointsEarned: true },
      }),
      // Total points redeemed
      prisma.redemption.aggregate({
        where: { customerId: customer.id },
        _sum: { pointsUsed: true },
      }),
      // Total amount spent
      prisma.transaction.aggregate({
        where: { customerId: customer.id },
        _sum: { amount: true },
      }),
      // Recent transactions (last 10)
      prisma.transaction.findMany({
        where: { customerId: customer.id },
        include: {
          merchant: {
            select: { shopName: true, category: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Recent redemptions (last 10)
      prisma.redemption.findMany({
        where: { customerId: customer.id },
        include: {
          merchant: {
            select: { shopName: true, category: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Unique merchants visited
      prisma.transaction.groupBy({
        by: ["merchantId"],
        where: { customerId: customer.id },
        _count: { merchantId: true },
        _sum: { amount: true, pointsEarned: true },
        orderBy: { _count: { merchantId: "desc" } },
      }),
    ])

    // Get merchant details for visited merchants
    const merchantIds = merchantsVisited.map((m) => m.merchantId)
    const merchantDetails = await prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, shopName: true, category: true },
    })

    const merchantsWithDetails = merchantsVisited.map((mv) => {
      const merchant = merchantDetails.find((m) => m.id === mv.merchantId)
      return {
        merchant,
        visitCount: mv._count.merchantId,
        totalSpent: mv._sum.amount || 0,
        totalPointsEarned: mv._sum.pointsEarned || 0,
      }
    })

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalPoints: customer.totalPoints,
        memberSince: customer.createdAt,
      },
      stats: {
        totalTransactions,
        totalRedemptions,
        totalPointsEarned: totalPointsEarned._sum.pointsEarned || 0,
        totalPointsRedeemed: totalPointsRedeemed._sum.pointsUsed || 0,
        currentPoints: customer.totalPoints,
        totalSpent: totalSpent._sum.amount || 0,
        averageTransactionValue:
          totalTransactions > 0
            ? (totalSpent._sum.amount || 0) / totalTransactions
            : 0,
        merchantsVisited: merchantsVisited.length,
      },
      recentTransactions,
      recentRedemptions,
      favoritesMerchants: merchantsWithDetails.slice(0, 5),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
