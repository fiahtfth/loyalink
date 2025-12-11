"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPoints } from "@/lib/utils"
import { Search, Gift, TrendingUp, Clock, Store } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  pointsEarned: number
  type: string
  createdAt: string
  merchant: {
    shopName: string
    category: string
  }
}

interface Redemption {
  id: string
  pointsUsed: number
  discount: number
  createdAt: string
  merchant: {
    shopName: string
    category: string
  }
}

interface Customer {
  id: string
  name: string
  phone: string
  totalPoints: number
  createdAt: string
  transactions: Transaction[]
  redemptions: Redemption[]
}

export default function CustomersPage() {
  const [phone, setPhone] = useState("")
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    setError("")
    setCustomer(null)

    try {
      const res = await fetch(`/api/customers/${phone}`)
      if (res.ok) {
        const data = await res.json()
        setCustomer(data)
      } else {
        setError("No account found with this phone number. Earn points at any LOYALINK shop to get started!")
      }
    } catch (err) {
      console.error("Error fetching customer:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Points</h1>
        <p className="text-gray-600">Enter your WhatsApp number to view your rewards balance</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter 10-digit WhatsApp number"
                className="text-lg h-12"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Customer Details */}
      {customer && (
        <div className="space-y-6">
          {/* Points Balance */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 mb-1">Welcome back,</p>
                  <h2 className="text-2xl font-bold mb-4">{customer.name}</h2>
                  <div className="flex items-center gap-2">
                    <Gift className="w-6 h-6" />
                    <span className="text-sm text-amber-100">Your Points Balance</span>
                  </div>
                  <div className="text-5xl font-bold mt-2">
                    {formatPoints(customer.totalPoints)}
                  </div>
                  <p className="text-amber-100 mt-2">
                    = {formatCurrency(customer.totalPoints)} discount available
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <Gift className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Points Earned
                </CardTitle>
                <CardDescription>Your recent earnings</CardDescription>
              </CardHeader>
              <CardContent>
                {customer.transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {customer.transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-400" />
                            {txn.merchant.shopName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(txn.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="success">+{txn.pointsEarned} pts</Badge>
                          <div className="text-sm text-gray-500">{formatCurrency(txn.amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Redemptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="w-5 h-5 text-purple-500" />
                  Points Redeemed
                </CardTitle>
                <CardDescription>Your recent redemptions</CardDescription>
              </CardHeader>
              <CardContent>
                {customer.redemptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No redemptions yet</p>
                ) : (
                  <div className="space-y-3">
                    {customer.redemptions.map((redemption) => (
                      <div key={redemption.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-400" />
                            {redemption.merchant.shopName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(redemption.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">-{redemption.pointsUsed} pts</Badge>
                          <div className="text-sm text-green-600">Saved {formatCurrency(redemption.discount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Instructions for new users */}
      {!customer && !loading && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-3">How to earn points?</h3>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>Visit any LOYALINK partner shop</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>Scan the QR code displayed at the counter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>Enter your purchase amount to earn points automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                <span>Redeem your points at any partner shop!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
