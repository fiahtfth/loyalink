import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { customer: true }
        },
        redemptions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { customer: true }
        }
      }
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    return NextResponse.json(merchant)
  } catch (error) {
    console.error("Error fetching merchant:", error)
    return NextResponse.json({ error: "Failed to fetch merchant" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const merchant = await prisma.merchant.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(merchant)
  } catch (error) {
    console.error("Error updating merchant:", error)
    return NextResponse.json({ error: "Failed to update merchant" }, { status: 500 })
  }
}
