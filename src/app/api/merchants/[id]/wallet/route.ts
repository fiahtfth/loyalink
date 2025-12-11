import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, type } = body

    const merchant = await prisma.merchant.findUnique({
      where: { id },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    const newBalance = type === "ADD" 
      ? merchant.walletBalance + amount 
      : merchant.walletBalance - amount

    if (newBalance < 0) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: { walletBalance: newBalance },
    })

    return NextResponse.json(updatedMerchant)
  } catch (error) {
    console.error("Error updating wallet:", error)
    return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 })
  }
}
