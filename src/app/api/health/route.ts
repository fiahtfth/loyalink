import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { error } = await supabase.from("Merchant").select("id").limit(1)
    
    return NextResponse.json({
      status: error ? "unhealthy" : "healthy",
      timestamp: new Date().toISOString(),
      database: error ? "disconnected" : "connected",
      environment: process.env.NODE_ENV,
    }, { status: error ? 503 : 200 })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed",
      },
      { status: 503 }
    )
  }
}
