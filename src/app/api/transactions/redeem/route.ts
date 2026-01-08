import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { redeemTransactionSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody, AppError } from "@/lib/errors"
import { getCustomerTierAtMerchant } from "@/lib/tier-utils"
import { createLedgerEntry } from "@/lib/ledger-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(redeemTransactionSchema, body)
    const { merchantId, customerPhone, pointsToRedeem, otp } = validatedData

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

    const customer = await prisma.customer.findUnique({
      where: { phone: customerPhone },
    })

    if (!customer) {
      throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND")
    }

    if (customer.totalPoints < pointsToRedeem) {
      throw new AppError(
        `Insufficient points. Available: ${customer.totalPoints}`,
        400,
        "INSUFFICIENT_POINTS"
      )
    }

    const discount = pointsToRedeem
    const settlementAmount = pointsToRedeem * merchant.settlementRate

    const lastEarnTransaction = await prisma.transaction.findFirst({
      where: {
        customerId: customer.id,
        type: "EARN",
      },
      orderBy: { createdAt: "desc" },
    })

    const isHomeStore = lastEarnTransaction?.earnMerchantId === merchantId
    const customerTier = await getCustomerTierAtMerchant(customer.id, merchantId)

    let homeStoreBonusPoints = 0
    let tierBonusPoints = 0
    let mallBonusPoints = 0

    if (isHomeStore && customerTier) {
      tierBonusPoints = Math.floor(pointsToRedeem * customerTier.tierBonusRate)
      homeStoreBonusPoints = tierBonusPoints
    }

    if (merchant.mall?.bonusEnabled && merchant.mall.bonusWallet > 0 && lastEarnTransaction?.merchantId) {
      const earnMerchant = await prisma.merchant.findUnique({
        where: { id: lastEarnTransaction.merchantId },
      })
      
      if (earnMerchant?.mallId === merchant.mallId) {
        const potentialMallBonus = Math.floor(pointsToRedeem * merchant.mall.bonusRate)
        mallBonusPoints = Math.min(potentialMallBonus, merchant.mall.bonusWallet)
      }
    }

    const totalBonusPoints = homeStoreBonusPoints + mallBonusPoints

    const result = await prisma.$transaction(async (tx) => {
      const redemption = await tx.redemption.create({
        data: {
          merchantId,
          customerId: customer.id,
          pointsUsed: pointsToRedeem,
          discount,
          settlementAmount,
          isHomeStore,
          homeStoreBonusPoints,
          tierBonusPoints,
          mallBonusPoints,
          otpVerified: !!otp,
        },
      })

      await tx.customer.update({
        where: { id: customer.id },
        data: { totalPoints: { decrement: pointsToRedeem } },
      })

      await tx.merchant.update({
        where: { id: merchantId },
        data: { walletBalance: { increment: settlementAmount } },
      })

      await tx.ledger.create({
        data: {
          customerId: customer.id,
          merchantId,
          mallId: merchant.mallId,
          entryType: "REDEEM",
          points: -pointsToRedeem,
          cashEquivalent: discount,
          description: `Redeemed ${pointsToRedeem} points for ₹${discount} at ${merchant.shopName}`,
          metadata: {
            settlementRate: merchant.settlementRate,
            settlementAmount,
            isHomeStore,
            redemptionId: redemption.id,
          },
        },
      })

      if (homeStoreBonusPoints > 0) {
        await tx.customer.update({
          where: { id: customer.id },
          data: { totalPoints: { increment: homeStoreBonusPoints } },
        })

        await tx.ledger.create({
          data: {
            customerId: customer.id,
            merchantId,
            mallId: merchant.mallId,
            entryType: "HOME_STORE_BONUS",
            points: homeStoreBonusPoints,
            cashEquivalent: 0,
            description: `Home-store loyalty bonus: ${homeStoreBonusPoints} points (${customerTier.tier} tier)`,
            metadata: {
              tier: customerTier.tier,
              bonusRate: customerTier.tierBonusRate,
              redemptionId: redemption.id,
            },
          },
        })
      }

      if (mallBonusPoints > 0 && merchant.mall) {
        await tx.customer.update({
          where: { id: customer.id },
          data: { totalPoints: { increment: mallBonusPoints } },
        })

        await tx.mall.update({
          where: { id: merchant.mallId! },
          data: { bonusWallet: { decrement: mallBonusPoints } },
        })

        await tx.ledger.create({
          data: {
            customerId: customer.id,
            merchantId,
            mallId: merchant.mallId,
            entryType: "MALL_BONUS",
            points: mallBonusPoints,
            cashEquivalent: 0,
            description: `Mall loyalty bonus: ${mallBonusPoints} points at ${merchant.mall.name}`,
            metadata: {
              mallName: merchant.mall.name,
              bonusRate: merchant.mall.bonusRate,
              redemptionId: redemption.id,
            },
          },
        })
      }

      return redemption
    })

    const newTotalPoints = customer.totalPoints - pointsToRedeem + totalBonusPoints

    return NextResponse.json({
      success: true,
      redemption: result,
      discount,
      settlementAmount,
      remainingPoints: newTotalPoints,
      bonuses: {
        homeStoreBonus: homeStoreBonusPoints,
        tierBonus: tierBonusPoints,
        mallBonus: mallBonusPoints,
        total: totalBonusPoints,
      },
      isHomeStore,
      tier: customerTier.tier,
      message: `Redeemed ${pointsToRedeem} points for ₹${discount} discount at ${merchant.shopName}!${totalBonusPoints > 0 ? ` Earned ${totalBonusPoints} bonus points!` : ''}`
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
