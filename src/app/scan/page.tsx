"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { formatPoints, generateWhatsAppLink } from "@/lib/utils"
import { QrCode, Check, Store, MessageCircle } from "lucide-react"

interface Merchant {
  id: string
  shopName: string
  category: string
  pointsRate: number
}

function ScanPageContent() {
  const searchParams = useSearchParams()
  const merchantId = searchParams.get("merchant")
  
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [selectedMerchant, setSelectedMerchant] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{
    pointsEarned: number
    newTotalPoints: number
    merchantName: string
  } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMerchants()
  }, [])

  useEffect(() => {
    if (merchantId) {
      setSelectedMerchant(merchantId)
    }
  }, [merchantId])

  const fetchMerchants = async () => {
    try {
      const res = await fetch("/api/merchants")
      const data = await res.json()
      setMerchants(data.filter((m: Merchant & { isActive: boolean }) => m.isActive))
    } catch (error) {
      console.error("Error fetching merchants:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMerchant || !customerPhone || !amount) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/transactions/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: selectedMerchant,
          customerPhone,
          customerName: customerName || "Customer",
          amount: parseFloat(amount)
        })
      })

      const data = await res.json()

      if (res.ok) {
        const merchant = merchants.find(m => m.id === selectedMerchant)
        setSuccess({
          pointsEarned: data.pointsEarned,
          newTotalPoints: data.newTotalPoints,
          merchantName: merchant?.shopName || ""
        })
        setCustomerPhone("")
        setCustomerName("")
        setAmount("")
      } else {
        setError(data.error || "Failed to process transaction")
      }
    } catch (err) {
      console.error("Error processing transaction:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const selectedMerchantData = merchants.find(m => m.id === selectedMerchant)
  const estimatedPoints = amount && selectedMerchantData 
    ? Math.floor((parseFloat(amount) / 100) * selectedMerchantData.pointsRate)
    : 0

  if (success) {
    const whatsappMessage = `🎉 Congratulations! You earned ${success.pointsEarned} LOYALINK points at ${success.merchantName}!\n\n💰 Your total balance: ${success.newTotalPoints} points\n\n✨ Redeem your points at any LOYALINK partner shop!\n\nPowered by LOYALINK - One QR Code. Infinite Rewards.`
    
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Points Earned!</h2>
            <p className="text-gray-600 mb-6">Transaction completed successfully</p>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white mb-6">
              <div className="text-5xl font-bold mb-2">+{success.pointsEarned}</div>
              <div className="text-amber-100">points earned at {success.merchantName}</div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm text-amber-100">New Balance</div>
                <div className="text-2xl font-bold">{formatPoints(success.newTotalPoints)} points</div>
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
              New Transaction
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earn Points</h1>
        <p className="text-gray-600">Record a purchase to earn reward points</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Enter the purchase information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select Shop</label>
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
              <label className="text-sm font-medium text-gray-700">Customer WhatsApp Number</label>
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Customer Name (Optional)</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer's name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Purchase Amount (₹)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>

            {estimatedPoints > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-700">Points to earn:</span>
                  <span className="text-2xl font-bold text-amber-600">+{estimatedPoints}</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  1 point per ₹100 spent
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Store className="w-5 h-5 mr-2" />
                  Record & Earn Points
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    }>
      <ScanPageContent />
    </Suspense>
  )
}
