import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { merchant: true }
        },
        redemptions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { merchant: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}
