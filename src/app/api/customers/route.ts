import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { customerSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0)

    const { data: customers, error, count } = await supabase
      .from("Customer")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    if (searchParams.has("limit") || searchParams.has("offset")) {
      return NextResponse.json({
        customers: customers || [],
        total: count ?? (customers?.length || 0),
        limit,
        offset,
      })
    }
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
      .maybeSingle()

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
