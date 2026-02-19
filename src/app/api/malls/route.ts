import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { mallSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    let query = supabase.from("Mall").select("*").order("createdAt", { ascending: false })

    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get("isActive")
    if (isActive !== null) query = query.eq("isActive", isActive === "true")

    const { data: malls, error } = await query
    if (error) throw error

    return NextResponse.json(malls || [])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(mallSchema, body)

    const { data: mall, error } = await supabase
      .from("Mall")
      .insert({
        id: genId(),
        name: validatedData.name,
        location: validatedData.location,
        bonusRate: validatedData.bonusRate,
        bonusEnabled: validatedData.bonusEnabled,
        bonusWallet: 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(mall, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
