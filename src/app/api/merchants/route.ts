import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { merchantSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true, redemptions: true }
        }
      },
      take: 100,
    })
    return NextResponse.json(merchants)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(merchantSchema, body)

    const merchant = await prisma.merchant.create({
      data: {
        name: validatedData.name,
        shopName: validatedData.shopName,
        phone: validatedData.phone,
        category: validatedData.category,
        address: validatedData.address,
        mallId: validatedData.mallId,
        settlementRate: validatedData.settlementRate,
        walletBalance: 0,
      },
    })

    return NextResponse.json(merchant, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
