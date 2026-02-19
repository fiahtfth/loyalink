import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { redeemTransactionSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody, AppError } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(redeemTransactionSchema, body)
    const { merchantId, customerPhone, pointsToRedeem, otp } = validatedData

    // Fetch merchant
    const { data: merchant, error: merchantErr } = await supabase
      .from("Merchant")
      .select("*")
      .eq("id", merchantId)
      .single()

    if (merchantErr || !merchant) {
      throw new AppError("Merchant not found", 404, "MERCHANT_NOT_FOUND")
    }

    if (!merchant.isActive) {
      throw new AppError("Merchant is not active", 400, "MERCHANT_INACTIVE")
    }

    // Fetch customer
    const { data: customer, error: custErr } = await supabase
      .from("Customer")
      .select("*")
      .eq("phone", customerPhone)
      .single()

    if (custErr || !customer) {
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

    // Create redemption
    const { data: redemption, error: redeemErr } = await supabase
      .from("Redemption")
      .insert({
        id: genId(),
        merchantId,
        customerId: customer.id,
        pointsUsed: pointsToRedeem,
        discount,
        settlementAmount,
        isHomeStore: false,
        homeStoreBonusPoints: 0,
        tierBonusPoints: 0,
        mallBonusPoints: 0,
        otpVerified: !!otp,
      })
      .select()
      .single()

    if (redeemErr) throw redeemErr

    // Deduct points from customer
    await supabase
      .from("Customer")
      .update({ totalPoints: customer.totalPoints - pointsToRedeem })
      .eq("id", customer.id)

    // Credit settlement to merchant wallet
    await supabase
      .from("Merchant")
      .update({ walletBalance: merchant.walletBalance + settlementAmount })
      .eq("id", merchantId)

    // Create ledger entry
    await supabase.from("Ledger").insert({
      id: genId(),
      customerId: customer.id,
      merchantId,
      mallId: merchant.mallId || null,
      entryType: "REDEEM",
      points: -pointsToRedeem,
      cashEquivalent: discount,
      description: `Redeemed ${pointsToRedeem} points for ₹${discount} at ${merchant.shopName}`,
      metadata: {
        settlementRate: merchant.settlementRate,
        settlementAmount,
        redemptionId: redemption.id,
      },
    })

    const newTotalPoints = customer.totalPoints - pointsToRedeem

    return NextResponse.json({
      success: true,
      redemption,
      discount,
      settlementAmount,
      remainingPoints: newTotalPoints,
      message: `Redeemed ${pointsToRedeem} points for ₹${discount} discount at ${merchant.shopName}!`,
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
