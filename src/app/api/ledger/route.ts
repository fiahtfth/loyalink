import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { handleApiError, AppError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get("customerId")
    const merchantId = searchParams.get("merchantId")
    const entryType = searchParams.get("entryType")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!customerId && !merchantId) {
      throw new AppError(
        "Either customerId or merchantId must be provided",
        400,
        "MISSING_PARAMETER"
      )
    }

    let query = supabase
      .from("Ledger")
      .select("*, Merchant(shopName, category), Customer(name, phone)")
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1)

    if (customerId) query = query.eq("customerId", customerId)
    if (merchantId) query = query.eq("merchantId", merchantId)
    if (entryType) query = query.eq("entryType", entryType)

    const { data: entries, error } = await query
    if (error) throw error

    return NextResponse.json({
      entries: (entries || []).map((e) => ({
        ...e,
        merchant: e.Merchant,
        customer: e.Customer,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
