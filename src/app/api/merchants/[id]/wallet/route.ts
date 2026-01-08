import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

    const merchant = await prisma.merchant.findUnique({
      where: { id },
    })

    if (!merchant) {
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

    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: { walletBalance: newBalance },
    })

    return NextResponse.json(updatedMerchant)
  } catch (error) {
    return handleApiError(error)
  }
}
