import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params

    const { data: customer, error } = await supabase
      .from("Customer")
      .select("*")
      .eq("phone", phone)
      .single()

    if (error || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const { data: transactions } = await supabase
      .from("Transaction")
      .select("*, Merchant(shopName, category)")
      .eq("customerId", customer.id)
      .order("createdAt", { ascending: false })
      .limit(20)

    const { data: redemptions } = await supabase
      .from("Redemption")
      .select("*, Merchant(shopName, category)")
      .eq("customerId", customer.id)
      .order("createdAt", { ascending: false })
      .limit(20)

    return NextResponse.json({
      ...customer,
      transactions: (transactions || []).map((t) => ({
        ...t,
        merchant: { shopName: t.Merchant?.shopName, category: t.Merchant?.category },
      })),
      redemptions: (redemptions || []).map((r) => ({
        ...r,
        merchant: { shopName: r.Merchant?.shopName, category: r.Merchant?.category },
      })),
    })
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}
