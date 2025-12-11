import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantId, customerPhone, customerName, amount } = body

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    if (!merchant.isActive) {
      return NextResponse.json({ error: "Merchant is not active" }, { status: 400 })
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone: customerPhone },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: { 
          name: customerName || "Customer", 
          phone: customerPhone,
          totalPoints: 0
        },
      })
    }

    // Calculate points (1 point per 100 rupees by default, adjusted by merchant rate)
    const pointsEarned = Math.floor((amount / 100) * merchant.pointsRate)

    // Deduct from merchant wallet
    if (merchant.walletBalance < pointsEarned) {
      return NextResponse.json({ 
        error: "Merchant has insufficient wallet balance for rewards" 
      }, { status: 400 })
    }

    // Create transaction and update balances
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          merchantId,
          customerId: customer.id,
          amount,
          pointsEarned,
          type: "EARN",
        },
        include: { merchant: true, customer: true }
      }),
      prisma.customer.update({
        where: { id: customer.id },
        data: { totalPoints: { increment: pointsEarned } },
      }),
      prisma.merchant.update({
        where: { id: merchantId },
        data: { walletBalance: { decrement: pointsEarned } },
      }),
    ])

    return NextResponse.json({
      success: true,
      transaction,
      pointsEarned,
      newTotalPoints: customer.totalPoints + pointsEarned,
      message: `Earned ${pointsEarned} points at ${merchant.shopName}!`
    }, { status: 201 })
  } catch (error) {
    console.error("Error processing earn transaction:", error)
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 })
  }
}
