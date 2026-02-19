import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { handleApiError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const merchantId = searchParams.get("merchantId")
    const customerId = searchParams.get("customerId")
    const type = searchParams.get("type")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("Transaction")
      .select("*, Merchant(id, shopName, category), Customer(id, name, phone)")
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1)

    if (merchantId) query = query.eq("merchantId", merchantId)
    if (customerId) query = query.eq("customerId", customerId)
    if (type) query = query.eq("type", type)

    const { data: transactions, error } = await query
    if (error) throw error

    return NextResponse.json({
      transactions: (transactions || []).map((t) => ({
        ...t,
        merchant: t.Merchant,
        customer: t.Customer,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
