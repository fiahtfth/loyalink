import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { handleApiError, AppError } from "@/lib/errors"

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
      throw new AppError("Merchant not found", 404, "MERCHANT_NOT_FOUND")
    }

    const [txnRes, redemptionRes] = await Promise.all([
      supabase
        .from("Transaction")
        .select("*, Customer(name, phone)")
        .eq("merchantId", id)
        .order("createdAt", { ascending: false })
        .limit(20),
      supabase
        .from("Redemption")
        .select("*")
        .eq("merchantId", id),
    ])

    const transactions = txnRes.data || []
    const redemptions = redemptionRes.data || []

    const totalPointsDistributed = transactions.reduce((sum, t) => sum + (t.pointsEarned || 0), 0)
    const totalPointsRedeemed = redemptions.reduce((sum, r) => sum + (r.pointsUsed || 0), 0)
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        shopName: merchant.shopName,
        category: merchant.category,
        walletBalance: merchant.walletBalance,
        isActive: merchant.isActive,
      },
      stats: {
        totalTransactions: transactions.length,
        totalRedemptions: redemptions.length,
        totalPointsDistributed,
        totalPointsRedeemed,
        totalRevenue,
        averageTransactionValue:
          transactions.length > 0 ? totalRevenue / transactions.length : 0,
      },
      recentTransactions: transactions.slice(0, 10).map((t) => ({
        ...t,
        customer: t.Customer,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
