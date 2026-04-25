import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { mallUpdateSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody, AppError } from "@/lib/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: mall, error } = await supabase
      .from("Mall")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !mall) {
      throw new AppError("Mall not found", 404, "MALL_NOT_FOUND")
    }

    const { data: merchants } = await supabase
      .from("Merchant")
      .select("id, shopName, category, isActive")
      .eq("mallId", id)

    return NextResponse.json({ ...mall, merchants: merchants || [] })
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
    const validatedData = validateRequestBody(mallUpdateSchema, body)

    const { data: mall, error } = await supabase
      .from("Mall")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(mall)
  } catch (error) {
    return handleApiError(error)
  }
}
