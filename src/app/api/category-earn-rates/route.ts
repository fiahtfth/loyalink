import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categoryEarnRateSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"

export async function GET() {
  try {
    const rates = await prisma.categoryEarnRate.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    })

    return NextResponse.json(rates)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(categoryEarnRateSchema, body)

    const rate = await prisma.categoryEarnRate.upsert({
      where: { category: validatedData.category },
      update: { earnRate: validatedData.earnRate },
      create: {
        category: validatedData.category,
        earnRate: validatedData.earnRate,
      },
    })

    return NextResponse.json(rate, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
