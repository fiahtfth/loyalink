"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { formatCurrency, formatPoints, generateWhatsAppLink } from "@/lib/utils"
import { Gift, Check, Search, MessageCircle } from "lucide-react"

interface Merchant {
  id: string
  shopName: string
  category: string
}

interface Customer {
  id: string
  name: string
  phone: string
  totalPoints: number
}

export default function RedeemPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [selectedMerchant, setSelectedMerchant] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [pointsToRedeem, setPointsToRedeem] = useState("")
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [success, setSuccess] = useState<{
    pointsUsed: number
    discount: number
    remainingPoints: number
    merchantName: string
  } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const res = await fetch("/api/merchants")
      const data = await res.json()
      setMerchants(data.filter((m: Merchant & { isActive: boolean }) => m.isActive))
    } catch (error) {
      console.error("Error fetching merchants:", error)
    }
  }

  const searchCustomer = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setSearching(true)
    setError("")
    setCustomer(null)

    try {
      const res = await fetch(`/api/customers/${customerPhone}`)
      if (res.ok) {
        const data = await res.json()
        setCustomer(data)
      } else {
        setError("Customer not found. They need to earn points first!")
      }
    } catch (err) {
      console.error("Error searching customer:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMerchant || !customer || !pointsToRedeem) {
      setError("Please fill in all required fields")
      return
    }

    const points = parseInt(pointsToRedeem)
    if (points > customer.totalPoints) {
      setError(`Customer only has ${customer.totalPoints} points available`)
      return
    }

    if (points < 1) {
      setError("Minimum 1 point required for redemption")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/transactions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: selectedMerchant,
          customerPhone: customer.phone,
          pointsToRedeem: points
        })
      })

      const data = await res.json()

      if (res.ok) {
        const merchant = merchants.find(m => m.id === selectedMerchant)
        setSuccess({
          pointsUsed: data.redemption.pointsUsed,
          discount: data.discount,
          remainingPoints: data.remainingPoints,
          merchantName: merchant?.shopName || ""
        })
        setCustomer(null)
        setPointsToRedeem("")
      } else {
        setError(data.error || "Failed to process redemption")
      }
    } catch (err) {
      console.error("Error processing redemption:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const discount = pointsToRedeem ? parseInt(pointsToRedeem) : 0

  if (success) {
    const whatsappMessage = `🎁 You redeemed ${success.pointsUsed} LOYALINK points at ${success.merchantName}!\n\n💸 Discount applied: ${formatCurrency(success.discount)}\n💰 Remaining balance: ${success.remainingPoints} points\n\n✨ Keep earning and redeeming at any LOYALINK partner shop!\n\nPowered by LOYALINK - One QR Code. Infinite Rewards.`
    
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Points Redeemed!</h2>
            <p className="text-gray-600 mb-6">Discount applied successfully</p>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white mb-6">
              <div className="text-4xl font-bold mb-2">{formatCurrency(success.discount)}</div>
              <div className="text-purple-100">discount at {success.merchantName}</div>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-purple-100">Points Used</div>
                  <div className="text-xl font-bold">-{success.pointsUsed}</div>
                </div>
                <div>
                  <div className="text-sm text-purple-100">Remaining</div>
                  <div className="text-xl font-bold">{formatPoints(success.remainingPoints)}</div>
                </div>
              </div>
            </div>

            <a
              href={generateWhatsAppLink(customerPhone, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-green-500 text-white rounded-lg py-3 font-medium hover:bg-green-600 transition-colors mb-4"
            >
              <MessageCircle className="w-5 h-5" />
              Share via WhatsApp
            </a>

            <Button variant="outline" className="w-full" onClick={() => setSuccess(null)}>
              New Redemption
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Redeem Points</h1>
        <p className="text-gray-600">Use your points for instant discounts</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Find Customer</CardTitle>
          <CardDescription>Search by WhatsApp number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                setCustomer(null)
              }}
              placeholder="10-digit WhatsApp number"
            />
            <Button onClick={searchCustomer} disabled={searching}>
              {searching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {customer && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{customer.name}</CardTitle>
                <CardDescription>{customer.phone}</CardDescription>
              </div>
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                {formatPoints(customer.totalPoints)} pts
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Redeem At</label>
                <Select
                  value={selectedMerchant}
                  onChange={(e) => setSelectedMerchant(e.target.value)}
                  required
                >
                  <option value="">Choose a shop...</option>
                  {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.shopName} ({merchant.category})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Points to Redeem</label>
                <Input
                  type="number"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  placeholder={`Max: ${customer.totalPoints}`}
                  min="1"
                  max={customer.totalPoints}
                  required
                />
              </div>

              {discount > 0 && discount <= customer.totalPoints && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700">Discount amount:</span>
                    <span className="text-2xl font-bold text-purple-600">{formatCurrency(discount)}</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    1 point = ₹1 discount
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" size="lg" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Redeem Points
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {error && !customer && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
          {error}
        </div>
      )}
    </div>
  )
}
