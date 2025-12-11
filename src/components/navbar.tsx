"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Store, Users, LayoutDashboard, QrCode, Gift } from "lucide-react"

const navigation = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Merchants", href: "/merchants", icon: Store },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Scan & Earn", href: "/scan", icon: QrCode },
  { name: "Redeem", href: "/redeem", icon: Gift },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="font-bold text-xl text-gray-900">LOYALINK</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber-100 text-amber-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto py-2 px-4 gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
