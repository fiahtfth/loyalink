import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users, QrCode, Gift, Wallet, TrendingUp, MessageCircle, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Universal Rewards Network
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            One QR Code.<br />
            <span className="text-amber-500">Infinite Rewards.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A shared rewards network for small shops — powered by WhatsApp. 
            Customers earn points at one store, redeem at many others.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/merchants">
                <Store className="w-5 h-5 mr-2" />
                Register Your Shop
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/customers">
                <Users className="w-5 h-5 mr-2" />
                Check Your Points
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How LOYALINK Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 border-amber-100">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>1. Scan QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Customer scans the shop&apos;s unique QR code displayed at the counter
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-amber-100">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>2. Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Points are automatically added based on purchase amount — 1 point per ₹100
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-amber-100">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>3. Redeem Anywhere</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Use your points at any participating shop — 1 point = ₹1 discount
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Merchants */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Shop Owners</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Prepaid Wallet</h3>
                    <p className="text-gray-600">Add funds to your wallet. Points are deducted when customers earn rewards.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">One QR Code</h3>
                    <p className="text-gray-600">Display your unique QR code. No POS integration needed.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">WhatsApp Powered</h3>
                    <p className="text-gray-600">All notifications via WhatsApp. No app downloads required.</p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/merchants">
                  Get Started Free
                </Link>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Join 500+ Shops</h3>
              <p className="text-amber-100 mb-6">
                Bakeries, salons, kirana stores, boutiques, cafés, and more are already part of the LOYALINK network.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-3xl font-bold">₹0</div>
                  <div className="text-sm text-amber-100">Setup Cost</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-3xl font-bold">2%</div>
                  <div className="text-sm text-amber-100">Per Transaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Perfect for Every Small Shop</h2>
          <p className="text-gray-600 mb-12">No matter what you sell, LOYALINK helps you retain customers</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Kirana Stores", "Bakeries", "Salons", "Boutiques", "Cafés", "Repair Shops", "Pharmacies", "Stationery", "Sweet Shops", "Tailors"].map((category) => (
              <span key={category} className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 font-medium">
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl">LOYALINK</span>
          </div>
          <p className="text-gray-400 mb-6">A shared rewards network for small shops</p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/merchants" className="hover:text-white">Merchants</Link>
            <Link href="/customers" className="hover:text-white">Customers</Link>
            <Link href="/scan" className="hover:text-white">Scan & Earn</Link>
            <Link href="/redeem" className="hover:text-white">Redeem</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
