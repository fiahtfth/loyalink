import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { customerSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { transactions: true, redemptions: true }
        }
      },
      take: 100,
    })
    return NextResponse.json(customers)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(customerSchema, body)

    let customer = await prisma.customer.findUnique({
      where: { phone: validatedData.phone },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: { 
          name: validatedData.name, 
          phone: validatedData.phone, 
          totalPoints: 0 
        },
      })
    }

    return NextResponse.json(customer, { status: customer ? 200 : 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
