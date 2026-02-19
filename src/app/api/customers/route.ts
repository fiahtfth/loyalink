import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { customerSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function GET() {
  try {
    const { data: customers, error } = await supabase
      .from("Customer")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json(customers || [])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(customerSchema, body)

    const { data: existing } = await supabase
      .from("Customer")
      .select("*")
      .eq("phone", validatedData.phone)
      .single()

    if (existing) {
      return NextResponse.json(existing, { status: 200 })
    }

    const { data: customer, error } = await supabase
      .from("Customer")
      .insert({
        id: genId(),
        name: validatedData.name,
        phone: validatedData.phone,
        totalPoints: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
