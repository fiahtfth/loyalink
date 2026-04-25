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
        .select("*, Customer(id, name, phone)")
        .eq("merchantId", id)
        .order("createdAt", { ascending: false }),
      supabase
        .from("Redemption")
        .select("*, Customer(id, name, phone)")
        .eq("merchantId", id)
        .order("createdAt", { ascending: false }),
    ])

    const transactions = txnRes.data || []
    const redemptions = redemptionRes.data || []

    const totalPointsDistributed = transactions.reduce((sum, t) => sum + (t.pointsEarned || 0), 0)
    const totalPointsRedeemed = redemptions.reduce((sum, r) => sum + (r.pointsUsed || 0), 0)
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    // Daily transaction buckets for last 30 days
    const now = new Date()
    const dailyBuckets: { date: string; revenue: number; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      dailyBuckets.push({
        date: d.toISOString().slice(0, 10),
        revenue: 0,
        count: 0,
      })
    }
    const bucketMap = new Map(dailyBuckets.map((b) => [b.date, b]))
    transactions.forEach((t) => {
      const key = new Date(t.createdAt).toISOString().slice(0, 10)
      const bucket = bucketMap.get(key)
      if (bucket) {
        bucket.revenue += t.amount || 0
        bucket.count += 1
      }
    })

    // Top customers by spend
    const customerSpendMap = new Map<
      string,
      { id: string; name: string; phone: string; spent: number; visits: number }
    >()
    transactions.forEach((t) => {
      const c = t.Customer
      if (!c?.id) return
      const existing = customerSpendMap.get(c.id) || {
        id: c.id,
        name: c.name,
        phone: c.phone,
        spent: 0,
        visits: 0,
      }
      existing.spent += t.amount || 0
      existing.visits += 1
      customerSpendMap.set(c.id, existing)
    })
    const topCustomers = Array.from(customerSpendMap.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        shopName: merchant.shopName,
        name: merchant.name,
        category: merchant.category,
        address: merchant.address,
        phone: merchant.phone,
        walletBalance: merchant.walletBalance,
        settlementRate: merchant.settlementRate,
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
        uniqueCustomers: customerSpendMap.size,
      },
      recentTransactions: transactions.slice(0, 10).map((t) => ({
        ...t,
        customer: t.Customer,
      })),
      recentRedemptions: redemptions.slice(0, 10).map((r) => ({
        ...r,
        customer: r.Customer,
      })),
      dailyTransactions: dailyBuckets,
      topCustomers,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
