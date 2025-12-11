"use client"

import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"

interface QRDisplayProps {
  merchantId: string
  shopName: string
  size?: number
}

export function QRDisplay({ merchantId, shopName, size = 200 }: QRDisplayProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const qrValue = `${baseUrl}/scan?merchant=${merchantId}`
  
  const handleDownload = () => {
    const svg = document.getElementById(`qr-${merchantId}`)
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    
    img.onload = () => {
      canvas.width = size * 2
      canvas.height = size * 2
      ctx?.drawImage(img, 0, 0, size * 2, size * 2)
      const pngFile = canvas.toDataURL("image/png")
      
      const downloadLink = document.createElement("a")
      downloadLink.download = `${shopName}-loyalink-qr.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${shopName} - LOYALINK`,
        text: `Scan to earn rewards at ${shopName}!`,
        url: `${window.location.origin}/scan?merchant=${merchantId}`,
      })
    }
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-lg">Your QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-xl border-2 border-dashed border-amber-200">
          <QRCodeSVG
            id={`qr-${merchantId}`}
            value={qrValue}
            size={size}
            level="H"
            includeMargin
            fgColor="#D97706"
          />
        </div>
        <p className="text-sm text-gray-500">
          Display this QR code at your shop for customers to scan
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
