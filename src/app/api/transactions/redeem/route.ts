import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantId, customerPhone, pointsToRedeem } = body

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    if (!merchant.isActive) {
      return NextResponse.json({ error: "Merchant is not active" }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({
      where: { phone: customerPhone },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    if (customer.totalPoints < pointsToRedeem) {
      return NextResponse.json({ 
        error: "Insufficient points",
        available: customer.totalPoints 
      }, { status: 400 })
    }

    // 1 point = 1 rupee discount
    const discount = pointsToRedeem

    // Create redemption and update customer points
    const [redemption] = await prisma.$transaction([
      prisma.redemption.create({
        data: {
          merchantId,
          customerId: customer.id,
          pointsUsed: pointsToRedeem,
          discount,
        },
        include: { merchant: true, customer: true }
      }),
      prisma.customer.update({
        where: { id: customer.id },
        data: { totalPoints: { decrement: pointsToRedeem } },
      }),
    ])

    return NextResponse.json({
      success: true,
      redemption,
      discount,
      remainingPoints: customer.totalPoints - pointsToRedeem,
      message: `Redeemed ${pointsToRedeem} points for ₹${discount} discount at ${merchant.shopName}!`
    }, { status: 201 })
  } catch (error) {
    console.error("Error processing redemption:", error)
    return NextResponse.json({ error: "Failed to process redemption" }, { status: 500 })
  }
}
