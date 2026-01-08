import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, AppError } from "@/lib/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mall = await prisma.mall.findUnique({
      where: { id },
      include: {
        merchants: {
          select: {
            id: true,
            shopName: true,
            category: true,
            isActive: true,
          },
        },
        _count: {
          select: { merchants: true, ledgerEntries: true },
        },
      },
    })

    if (!mall) {
      throw new AppError("Mall not found", 404, "MALL_NOT_FOUND")
    }

    return NextResponse.json(mall)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const mall = await prisma.mall.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(mall)
  } catch (error) {
    return handleApiError(error)
  }
}
