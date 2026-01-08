import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { earnTransactionSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody, AppError } from "@/lib/errors"
import { updateCustomerTier } from "@/lib/tier-utils"
import { createLedgerEntry } from "@/lib/ledger-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(earnTransactionSchema, body)
    const { merchantId, customerPhone, customerName, amount } = validatedData

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { mall: true },
    })

    if (!merchant) {
      throw new AppError("Merchant not found", 404, "MERCHANT_NOT_FOUND")
    }

    if (!merchant.isActive) {
      throw new AppError("Merchant is not active", 400, "MERCHANT_INACTIVE")
    }

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

    const categoryEarnRate = await prisma.categoryEarnRate.findUnique({
      where: { category: merchant.category },
    })

    const earnRate = categoryEarnRate?.earnRate || 1.0
    const pointsEarned = Math.floor((amount / 100) * earnRate)

    if (merchant.walletBalance < pointsEarned) {
      throw new AppError(
        "Merchant has insufficient wallet balance for rewards",
        400,
        "INSUFFICIENT_WALLET_BALANCE"
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          merchantId,
          customerId: customer.id,
          amount,
          pointsEarned,
          type: "EARN",
          earnMerchantId: merchantId,
        },
      })

      await tx.customer.update({
        where: { id: customer.id },
        data: { totalPoints: { increment: pointsEarned } },
      })

      await tx.merchant.update({
        where: { id: merchantId },
        data: { walletBalance: { decrement: pointsEarned } },
      })

      await tx.ledger.create({
        data: {
          customerId: customer.id,
          merchantId,
          mallId: merchant.mallId,
          entryType: "EARN",
          points: pointsEarned,
          cashEquivalent: amount,
          description: `Earned ${pointsEarned} points on purchase of ₹${amount} at ${merchant.shopName}`,
          metadata: {
            earnRate,
            category: merchant.category,
            transactionId: transaction.id,
          },
        },
      })

      return transaction
    })

    await updateCustomerTier(customer.id, merchantId, amount)

    return NextResponse.json({
      success: true,
      transaction: result,
      pointsEarned,
      newTotalPoints: customer.totalPoints + pointsEarned,
      message: `Earned ${pointsEarned} points at ${merchant.shopName}!`,
      earnRate,
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
