import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { walletUpdateSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody, AppError } from "@/lib/errors"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = validateRequestBody(walletUpdateSchema, body)
    const { amount, type } = validatedData

    const { data: merchant, error: fetchError } = await supabase
      .from("Merchant")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !merchant) {
      throw new AppError("Merchant not found", 404, "MERCHANT_NOT_FOUND")
    }

    const newBalance = type === "ADD" 
      ? merchant.walletBalance + amount 
      : merchant.walletBalance - amount

    if (newBalance < 0) {
      throw new AppError(
        "Insufficient balance for this operation",
        400,
        "INSUFFICIENT_BALANCE"
      )
    }

    const { data: updatedMerchant, error: updateError } = await supabase
      .from("Merchant")
      .update({ walletBalance: newBalance })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(updatedMerchant)
  } catch (error) {
    return handleApiError(error)
  }
}
