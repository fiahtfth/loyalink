import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { merchantSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0)

    const { data: merchants, error, count } = await supabase
      .from("Merchant")
      .select("*", { count: "exact" })
      .eq("isActive", true)
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const merchantIds = (merchants || []).map((m) => m.id)

    const [txnRes, redemptionRes] = merchantIds.length
      ? await Promise.all([
          supabase.from("Transaction").select("merchantId").in("merchantId", merchantIds),
          supabase.from("Redemption").select("merchantId").in("merchantId", merchantIds),
        ])
      : [{ data: [] }, { data: [] }]

    const txnCountMap: Record<string, number> = {}
    const redemptionCountMap: Record<string, number> = {}
    ;(txnRes.data || []).forEach((t) => {
      txnCountMap[t.merchantId] = (txnCountMap[t.merchantId] || 0) + 1
    })
    ;(redemptionRes.data || []).forEach((r) => {
      redemptionCountMap[r.merchantId] = (redemptionCountMap[r.merchantId] || 0) + 1
    })

    const result = (merchants || []).map((m) => ({
      ...m,
      _count: {
        transactions: txnCountMap[m.id] || 0,
        redemptions: redemptionCountMap[m.id] || 0,
      },
    }))

    // Maintain backwards compatibility: return array when no pagination requested,
    // wrapped object when pagination params present.
    if (searchParams.has("limit") || searchParams.has("offset")) {
      return NextResponse.json({ merchants: result, total: count ?? result.length, limit, offset })
    }
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateRequestBody(merchantSchema, body)

    const { data: merchant, error } = await supabase
      .from("Merchant")
      .insert({
        id: genId(),
        name: validatedData.name,
        shopName: validatedData.shopName,
        phone: validatedData.phone,
        category: validatedData.category,
        address: validatedData.address,
        mallId: validatedData.mallId || null,
        settlementRate: validatedData.settlementRate ?? 0.85,
        walletBalance: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(merchant, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
