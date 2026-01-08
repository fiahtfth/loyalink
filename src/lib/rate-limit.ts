import { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  interval: number // in milliseconds
  maxRequests: number
}

const defaultConfig: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { success: boolean; remaining: number; resetTime: number } {
  const identifier = getIdentifier(request)
  const now = Date.now()
  const resetTime = now + config.interval

  if (!store[identifier] || store[identifier].resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime,
    }
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }

  store[identifier].count++

  if (store[identifier].count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: store[identifier].resetTime,
    }
  }

  return {
    success: true,
    remaining: config.maxRequests - store[identifier].count,
    resetTime: store[identifier].resetTime,
  }
}

function getIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  return ip
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60 * 1000) // Clean up every minute
