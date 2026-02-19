import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { earnTransactionSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody, AppError } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(earnTransactionSchema, body)
    const { merchantId, customerPhone, customerName, amount } = validatedData

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

    // Find or create customer
    let { data: customer } = await supabase
      .from("Customer")
      .select("*")
      .eq("phone", customerPhone)
      .single()

    if (!customer) {
      const { data: newCustomer, error: createErr } = await supabase
        .from("Customer")
        .insert({
          id: genId(),
          name: customerName || "Customer",
          phone: customerPhone,
          totalPoints: 0,
        })
        .select()
        .single()

      if (createErr) throw createErr
      customer = newCustomer
    }

    // Get category earn rate
    const { data: categoryEarnRate } = await supabase
      .from("CategoryEarnRate")
      .select("*")
      .eq("category", merchant.category)
      .single()

    const earnRate = categoryEarnRate?.earnRate || 1.0
    const pointsEarned = Math.floor((amount / 100) * earnRate)

    if (pointsEarned === 0) {
      throw new AppError(
        "Purchase amount too low to earn points",
        400,
        "AMOUNT_TOO_LOW"
      )
    }

    if (merchant.walletBalance < pointsEarned) {
      throw new AppError(
        "Merchant has insufficient wallet balance for rewards",
        400,
        "INSUFFICIENT_WALLET_BALANCE"
      )
    }

    // Create transaction
    const { data: transaction, error: txnErr } = await supabase
      .from("Transaction")
      .insert({
        id: genId(),
        merchantId,
        customerId: customer!.id,
        amount,
        pointsEarned,
        type: "EARN",
        earnMerchantId: merchantId,
      })
      .select()
      .single()

    if (txnErr) throw txnErr

    // Update customer points
    await supabase
      .from("Customer")
      .update({ totalPoints: customer!.totalPoints + pointsEarned })
      .eq("id", customer!.id)

    // Deduct from merchant wallet
    await supabase
      .from("Merchant")
      .update({ walletBalance: merchant.walletBalance - pointsEarned })
      .eq("id", merchantId)

    // Create ledger entry
    await supabase.from("Ledger").insert({
      id: genId(),
      customerId: customer!.id,
      merchantId,
      mallId: merchant.mallId || null,
      entryType: "EARN",
      points: pointsEarned,
      cashEquivalent: amount,
      description: `Earned ${pointsEarned} points on purchase of ₹${amount} at ${merchant.shopName}`,
      metadata: {
        earnRate,
        category: merchant.category,
        transactionId: transaction.id,
      },
    })

    return NextResponse.json({
      success: true,
      transaction,
      pointsEarned,
      newTotalPoints: customer!.totalPoints + pointsEarned,
      message: `Earned ${pointsEarned} points at ${merchant.shopName}!`,
      earnRate,
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
