import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { merchantSchema } from "@/lib/validations"
import { handleApiError, validateRequestBody } from "@/lib/errors"
import { genId } from "@/lib/utils"

export async function GET() {
  try {
    const { data: merchants, error } = await supabase
      .from("Merchant")
      .select("*")
      .eq("isActive", true)
      .order("createdAt", { ascending: false })
      .limit(100)

    if (error) throw error

    // Get transaction and redemption counts per merchant
    const merchantIds = (merchants || []).map((m) => m.id)

    const { data: txnCounts } = await supabase
      .from("Transaction")
      .select("merchantId")
      .in("merchantId", merchantIds)

    const { data: redemptionCounts } = await supabase
      .from("Redemption")
      .select("merchantId")
      .in("merchantId", merchantIds)

    const txnCountMap: Record<string, number> = {}
    const redemptionCountMap: Record<string, number> = {}
    ;(txnCounts || []).forEach((t) => {
      txnCountMap[t.merchantId] = (txnCountMap[t.merchantId] || 0) + 1
    })
    ;(redemptionCounts || []).forEach((r) => {
      redemptionCountMap[r.merchantId] = (redemptionCountMap[r.merchantId] || 0) + 1
    })

    const result = (merchants || []).map((m) => ({
      ...m,
      _count: {
        transactions: txnCountMap[m.id] || 0,
        redemptions: redemptionCountMap[m.id] || 0,
      },
    }))

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
