"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRDisplay } from "@/components/qr-display"
import { formatCurrency, formatPoints } from "@/lib/utils"
import {
  ArrowLeft,
  TrendingUp,
  Gift,
  Users,
  Wallet,
  Receipt,
  Clock,
  Crown,
  Store,
  Phone,
  MapPin,
} from "lucide-react"

interface MerchantStats {
  merchant: {
    id: string
    shopName: string
    name: string
    category: string
    address: string
    phone: string
    walletBalance: number
    settlementRate: number
    isActive: boolean
  }
  stats: {
    totalTransactions: number
    totalRedemptions: number
    totalPointsDistributed: number
    totalPointsRedeemed: number
    totalRevenue: number
    averageTransactionValue: number
    uniqueCustomers: number
  }
  recentTransactions: Array<{
    id: string
    amount: number
    pointsEarned: number
    createdAt: string
    customer?: { name: string; phone: string }
  }>
  recentRedemptions: Array<{
    id: string
    pointsUsed: number
    discount: number
    settlementAmount: number
    createdAt: string
    customer?: { name: string; phone: string }
  }>
  dailyTransactions: Array<{ date: string; revenue: number; count: number }>
  topCustomers: Array<{
    id: string
    name: string
    phone: string
    spent: number
    visits: number
  }>
}

export default function MerchantDashboardPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<MerchantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!params?.id) return
    fetchStats(params.id)
  }, [params?.id])

  const fetchStats = async (id: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/merchants/${id}/stats`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to load merchant")
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load merchant")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card>
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="text-red-600 font-medium">{error || "Merchant not found"}</div>
            <Button onClick={() => router.push("/merchants")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to merchants
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { merchant, stats, recentTransactions, recentRedemptions, dailyTransactions, topCustomers } = data
  const maxRevenue = Math.max(1, ...dailyTransactions.map((d) => d.revenue))

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })

  const formatShortDate = (s: string) => {
    const d = new Date(s)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/merchants">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{merchant.shopName}</h1>
              <Badge variant={merchant.isActive ? "success" : "secondary"}>
                {merchant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1 flex items-center gap-2 flex-wrap text-sm">
              <span className="flex items-center gap-1">
                <Store className="w-4 h-4" /> {merchant.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {merchant.address}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {merchant.phone}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Wallet card */}
      <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
        <CardContent className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100 mb-1">
              <Wallet className="w-5 h-5" />
              <span>Wallet balance</span>
            </div>
            <div className="text-4xl font-bold">
              {formatCurrency(merchant.walletBalance)}
            </div>
            <div className="text-amber-100 text-sm mt-1">
              Settlement rate: {(merchant.settlementRate * 100).toFixed(0)}%
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={`/scan?merchant=${merchant.id}`}>
              <Button variant="secondary" className="bg-white text-amber-600 hover:bg-white/90 w-full sm:w-auto">
                <Receipt className="w-4 h-4 mr-2" />
                Record sale
              </Button>
            </Link>
            <Link href="/redeem">
              <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border border-white/30 w-full sm:w-auto">
                <Gift className="w-4 h-4 mr-2" />
                Redeem points
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="text-green-600"
        />
        <KpiCard
          icon={<Receipt className="w-4 h-4" />}
          label="Transactions"
          value={stats.totalTransactions.toString()}
          color="text-blue-600"
        />
        <KpiCard
          icon={<Gift className="w-4 h-4" />}
          label="Redemptions"
          value={stats.totalRedemptions.toString()}
          color="text-purple-600"
        />
        <KpiCard
          icon={<Users className="w-4 h-4" />}
          label="Customers"
          value={stats.uniqueCustomers.toString()}
          color="text-amber-600"
        />
        <KpiCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Pts given"
          value={formatPoints(stats.totalPointsDistributed)}
          color="text-emerald-600"
        />
        <KpiCard
          icon={<Gift className="w-4 h-4" />}
          label="Pts redeemed"
          value={formatPoints(stats.totalPointsRedeemed)}
          color="text-rose-600"
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue — last 30 days</CardTitle>
          <CardDescription>
            Avg transaction: {formatCurrency(stats.averageTransactionValue)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.totalTransactions === 0 ? (
            <p className="text-gray-500 text-center py-12">No transactions yet</p>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {dailyTransactions.map((d) => {
                const heightPct = (d.revenue / maxRevenue) * 100
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end group relative"
                  >
                    <div
                      className="w-full bg-amber-500 hover:bg-amber-600 transition-colors rounded-t"
                      style={{ height: `${Math.max(heightPct, d.revenue > 0 ? 4 : 0)}%` }}
                    />
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {formatShortDate(d.date)}: {formatCurrency(d.revenue)} ({d.count} txn)
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{formatShortDate(dailyTransactions[0]?.date || "")}</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Top customers
            </CardTitle>
            <CardDescription>By total spend</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No customers yet</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold flex items-center justify-center">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(c.spent)}</div>
                      <div className="text-xs text-gray-500">{c.visits} visit{c.visits === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle>Customer QR code</CardTitle>
            <CardDescription>Print and display at counter</CardDescription>
          </CardHeader>
          <CardContent>
            <QRDisplay merchantId={merchant.id} shopName={merchant.shopName} />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Recent transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{t.customer?.name || "Customer"}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(t.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(t.amount)}</div>
                      <Badge variant="success">+{t.pointsEarned} pts</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent redemptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Recent redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRedemptions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No redemptions yet</p>
            ) : (
              <div className="space-y-3">
                {recentRedemptions.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{r.customer?.name || "Customer"}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(r.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        −{formatCurrency(r.discount)}
                      </div>
                      <Badge variant="outline">−{r.pointsUsed} pts</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
          {icon}
          {label}
        </div>
        <div className="text-xl font-bold text-gray-900 mt-1 truncate">{value}</div>
      </CardContent>
    </Card>
  )
}
