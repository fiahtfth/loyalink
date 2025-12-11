"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { QRDisplay } from "@/components/qr-display"
import { formatCurrency } from "@/lib/utils"
import { Plus, Wallet, Store, Users, ArrowRight, X } from "lucide-react"

interface Merchant {
  id: string
  name: string
  shopName: string
  phone: string
  category: string
  address: string
  walletBalance: number
  pointsRate: number
  isActive: boolean
  createdAt: string
  _count?: {
    transactions: number
    redemptions: number
  }
}

const categories = [
  "Kirana Store",
  "Bakery",
  "Salon",
  "Boutique",
  "Café",
  "Repair Shop",
  "Pharmacy",
  "Stationery",
  "Sweet Shop",
  "Tailor",
  "Other"
]

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [walletAmount, setWalletAmount] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    phone: "",
    category: "Kirana Store",
    address: "",
    pointsRate: "1"
  })

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const res = await fetch("/api/merchants")
      const data = await res.json()
      setMerchants(data)
    } catch (error) {
      console.error("Error fetching merchants:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pointsRate: parseFloat(formData.pointsRate)
        })
      })
      if (res.ok) {
        setFormData({ name: "", shopName: "", phone: "", category: "Kirana Store", address: "", pointsRate: "1" })
        setShowForm(false)
        fetchMerchants()
      }
    } catch (error) {
      console.error("Error creating merchant:", error)
    }
  }

  const handleAddWallet = async () => {
    if (!selectedMerchant || !walletAmount) return
    try {
      const res = await fetch(`/api/merchants/${selectedMerchant.id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(walletAmount), type: "ADD" })
      })
      if (res.ok) {
        setWalletAmount("")
        fetchMerchants()
        const updated = await res.json()
        setSelectedMerchant(updated)
      }
    } catch (error) {
      console.error("Error adding wallet balance:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-600">Manage your shop and rewards</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Register Shop
        </Button>
      </div>

      {/* Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Register Your Shop</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>Join the LOYALINK network</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Your Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Shop Name</label>
                  <Input
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    placeholder="Enter shop name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Shop address"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Register Shop</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Merchant Detail Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedMerchant.shopName}</CardTitle>
                  <CardDescription>{selectedMerchant.category} • {selectedMerchant.address}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMerchant(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Section */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5" />
                  <span className="font-medium">Wallet Balance</span>
                </div>
                <div className="text-3xl font-bold mb-4">
                  {formatCurrency(selectedMerchant.walletBalance)}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    placeholder="Amount"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                  <Button 
                    variant="secondary" 
                    onClick={handleAddWallet}
                    className="bg-white text-amber-600 hover:bg-white/90"
                  >
                    Add Funds
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <QRDisplay merchantId={selectedMerchant.id} shopName={selectedMerchant.shopName} />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedMerchant._count?.transactions || 0}
                  </div>
                  <div className="text-sm text-gray-500">Transactions</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedMerchant._count?.redemptions || 0}
                  </div>
                  <div className="text-sm text-gray-500">Redemptions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Merchants List */}
      {merchants.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shops registered yet</h3>
            <p className="text-gray-500 mb-6">Be the first to join the LOYALINK network!</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Register Your Shop
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map((merchant) => (
            <Card 
              key={merchant.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedMerchant(merchant)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{merchant.shopName}</CardTitle>
                    <CardDescription>{merchant.name}</CardDescription>
                  </div>
                  <Badge variant={merchant.isActive ? "success" : "secondary"}>
                    {merchant.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Store className="w-4 h-4" />
                    {merchant.category}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">{formatCurrency(merchant.walletBalance)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      {merchant._count?.transactions || 0}
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-between" size="sm">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
