import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: merchant, error } = await supabase
      .from("Merchant")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    const { data: transactions } = await supabase
      .from("Transaction")
      .select("*, Customer(*)")
      .eq("merchantId", id)
      .order("createdAt", { ascending: false })
      .limit(10)

    const { data: redemptions } = await supabase
      .from("Redemption")
      .select("*, Customer(*)")
      .eq("merchantId", id)
      .order("createdAt", { ascending: false })
      .limit(10)

    return NextResponse.json({
      ...merchant,
      transactions: (transactions || []).map((t) => ({ ...t, customer: t.Customer })),
      redemptions: (redemptions || []).map((r) => ({ ...r, customer: r.Customer })),
    })
  } catch (error) {
    console.error("Error fetching merchant:", error)
    return NextResponse.json({ error: "Failed to fetch merchant" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: merchant, error } = await supabase
      .from("Merchant")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(merchant)
  } catch (error) {
    console.error("Error updating merchant:", error)
    return NextResponse.json({ error: "Failed to update merchant" }, { status: 500 })
  }
}
