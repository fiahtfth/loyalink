import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { handleApiError, AppError } from "@/lib/errors"

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
      throw new AppError("Customer not found", 404, "CUSTOMER_NOT_FOUND")
    }

    const [txnRes, redemptionRes] = await Promise.all([
      supabase
        .from("Transaction")
        .select("*, Merchant(shopName, category)")
        .eq("customerId", customer.id)
        .order("createdAt", { ascending: false }),
      supabase
        .from("Redemption")
        .select("*, Merchant(shopName, category)")
        .eq("customerId", customer.id)
        .order("createdAt", { ascending: false }),
    ])

    const transactions = txnRes.data || []
    const redemptions = redemptionRes.data || []

    const totalPointsEarned = transactions.reduce((sum, t) => sum + (t.pointsEarned || 0), 0)
    const totalPointsRedeemed = redemptions.reduce((sum, r) => sum + (r.pointsUsed || 0), 0)
    const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalPoints: customer.totalPoints,
        memberSince: customer.createdAt,
      },
      stats: {
        totalTransactions: transactions.length,
        totalRedemptions: redemptions.length,
        totalPointsEarned,
        totalPointsRedeemed,
        currentPoints: customer.totalPoints,
        totalSpent,
        averageTransactionValue:
          transactions.length > 0 ? totalSpent / transactions.length : 0,
      },
      recentTransactions: transactions.slice(0, 10).map((t) => ({
        ...t,
        merchant: t.Merchant,
      })),
      recentRedemptions: redemptions.slice(0, 10).map((r) => ({
        ...r,
        merchant: r.Merchant,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
