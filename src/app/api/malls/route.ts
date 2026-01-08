import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mallSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get("isActive")

    const where: any = {}
    if (isActive !== null) where.isActive = isActive === "true"

    const malls = await prisma.mall.findMany({
      where,
      include: {
        _count: {
          select: { merchants: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(malls)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(mallSchema, body)

    const mall = await prisma.mall.create({
      data: {
        name: validatedData.name,
        location: validatedData.location,
        bonusRate: validatedData.bonusRate,
        bonusEnabled: validatedData.bonusEnabled,
        bonusWallet: 0,
      },
    })

    return NextResponse.json(mall, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
