import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true, redemptions: true }
        }
      }
    })
    return NextResponse.json(merchants)
  } catch (error) {
    console.error("Error fetching merchants:", error)
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, shopName, phone, category, address, pointsRate } = body

    const merchant = await prisma.merchant.create({
      data: {
        name,
        shopName,
        phone,
        category,
        address,
        pointsRate: pointsRate || 1,
        walletBalance: 0,
      },
    })

    return NextResponse.json(merchant, { status: 201 })
  } catch (error) {
    console.error("Error creating merchant:", error)
    return NextResponse.json({ error: "Failed to create merchant" }, { status: 500 })
  }
}
