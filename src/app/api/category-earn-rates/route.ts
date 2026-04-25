import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { categoryEarnRateSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function GET() {
  try {
    const { data: rates, error } = await supabase
      .from("CategoryEarnRate")
      .select("*")
      .eq("isActive", true)
      .order("category", { ascending: true })

    if (error) throw error
    return NextResponse.json(rates || [])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(categoryEarnRateSchema, body)

    const { data: existing } = await supabase
      .from("CategoryEarnRate")
      .select("*")
      .eq("category", validatedData.category)
      .maybeSingle()

    let rate
    if (existing) {
      const { data, error } = await supabase
        .from("CategoryEarnRate")
        .update({ earnRate: validatedData.earnRate })
        .eq("id", existing.id)
        .select()
        .single()
      if (error) throw error
      rate = data
    } else {
      const { data, error } = await supabase
        .from("CategoryEarnRate")
        .insert({ id: genId(), category: validatedData.category, earnRate: validatedData.earnRate })
        .select()
        .single()
      if (error) throw error
      rate = data
    }

    return NextResponse.json(rate, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
