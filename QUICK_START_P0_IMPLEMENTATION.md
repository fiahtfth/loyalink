# 🚀 QUICK START: P0 Critical Features Implementation Guide

This guide provides step-by-step implementation for the **10 most critical P0 features** needed before production launch.

---

## 📋 P0 FEATURES CHECKLIST

- [ ] 1. Authentication & Authorization
- [ ] 2. OTP Service
- [ ] 3. Rate Limiting
- [ ] 4. Transaction Idempotency
- [ ] 5. Error Tracking (Sentry)
- [ ] 6. Database Backups
- [ ] 7. Enhanced Input Validation
- [ ] 8. API Documentation
- [ ] 9. Basic Testing
- [ ] 10. Environment Configuration

---

## 1️⃣ AUTHENTICATION & AUTHORIZATION

### Step 1: Install Dependencies
```bash
npm install next-auth@latest bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 2: Create Auth Schema
Add to `prisma/schema.prisma`:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  phone         String    @unique
  password      String
  role          String    // ADMIN, MERCHANT, CUSTOMER, MALL_MANAGER
  merchantId    String?
  customerId    String?
  mallId        String?
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([phone])
  @@index([email])
  @@index([role])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

### Step 3: Create Auth Utilities
Create `src/lib/auth/jwt.ts`:
```typescript
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  role: string
  phone: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}
```

Create `src/lib/auth/password.ts`:
```typescript
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
```

### Step 4: Create Auth Middleware
Create `src/lib/auth/auth-middleware.ts`:
```typescript
import { NextRequest } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'
import { AppError } from '../errors'

export async function requireAuth(
  request: NextRequest
): Promise<JWTPayload> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized - No token provided', 401, 'UNAUTHORIZED')
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload) {
    throw new AppError('Unauthorized - Invalid token', 401, 'INVALID_TOKEN')
  }

  return payload
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<JWTPayload> {
  const payload = await requireAuth(request)

  if (!allowedRoles.includes(payload.role)) {
    throw new AppError(
      'Forbidden - Insufficient permissions',
      403,
      'FORBIDDEN'
    )
  }

  return payload
}
```

### Step 5: Create Auth Endpoints
Create `src/app/api/auth/register/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { generateToken } from '@/lib/auth/jwt'
import { handleApiError, AppError } from '@/lib/errors'
import { z } from 'zod'

const registerSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['CUSTOMER', 'MERCHANT']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, name, role } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      throw new AppError('Phone number already registered', 400, 'PHONE_EXISTS')
    }

    const hashedPassword = await hashPassword(password)

    let userId: string
    let customerId: string | undefined
    let merchantId: string | undefined

    if (role === 'CUSTOMER') {
      const customer = await prisma.customer.create({
        data: { name, phone, totalPoints: 0 },
      })
      customerId = customer.id
      userId = customer.id
    } else {
      throw new AppError('Merchant registration requires admin approval', 400, 'MERCHANT_APPROVAL_REQUIRED')
    }

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        role,
        customerId,
        merchantId,
      },
    })

    const token = generateToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

Create `src/app/api/auth/login/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { generateToken } from '@/lib/auth/jwt'
import { handleApiError, AppError } from '@/lib/errors'
import { z } from 'zod'

const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE')
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = generateToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Step 6: Protect Existing Endpoints
Update `src/app/api/transactions/earn/route.ts`:
```typescript
import { requireRole } from '@/lib/auth/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    // Add authentication
    await requireRole(request, ['MERCHANT', 'ADMIN'])
    
    // ... rest of existing code
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## 2️⃣ OTP SERVICE

### Step 1: Install Dependencies
```bash
npm install twilio
npm install -D @types/node
```

### Step 2: Add OTP Schema
Already added in schema above.

### Step 3: Create OTP Service
Create `src/lib/otp/otp-service.ts`:
```typescript
import { prisma } from '../prisma'
import { AppError } from '../errors'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 3

export async function generateOTP(
  phone: string,
  purpose: 'REDEMPTION' | 'LOGIN' | 'VERIFICATION'
): Promise<string> {
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Delete any existing OTPs for this phone and purpose
  await prisma.oTP.deleteMany({
    where: { phone, purpose },
  })

  // Create new OTP
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES)

  await prisma.oTP.create({
    data: {
      phone,
      code,
      purpose,
      expiresAt,
    },
  })

  return code
}

export async function verifyOTP(
  phone: string,
  code: string,
  purpose: 'REDEMPTION' | 'LOGIN' | 'VERIFICATION'
): Promise<boolean> {
  const otp = await prisma.oTP.findFirst({
    where: {
      phone,
      purpose,
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) {
    throw new AppError('OTP not found or already used', 400, 'OTP_NOT_FOUND')
  }

  if (new Date() > otp.expiresAt) {
    throw new AppError('OTP has expired', 400, 'OTP_EXPIRED')
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    throw new AppError('Maximum OTP attempts exceeded', 400, 'MAX_ATTEMPTS_EXCEEDED')
  }

  // Increment attempts
  await prisma.oTP.update({
    where: { id: otp.id },
    data: { attempts: { increment: 1 } },
  })

  if (otp.code !== code) {
    return false
  }

  // Mark as verified
  await prisma.oTP.update({
    where: { id: otp.id },
    data: {
      verified: true,
      verifiedAt: new Date(),
    },
  })

  return true
}
```

Create `src/lib/otp/sms-provider.ts`:
```typescript
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!client) {
    console.warn('Twilio not configured, logging OTP instead:', message)
    return true
  }

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: `+91${to}`,
    })
    return true
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}

export async function sendOTP(phone: string, code: string): Promise<boolean> {
  const message = `Your Loyalink OTP is: ${code}. Valid for 5 minutes. Do not share with anyone.`
  return sendSMS(phone, message)
}
```

### Step 4: Create OTP Endpoints
Create `src/app/api/otp/generate/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateOTP } from '@/lib/otp/otp-service'
import { sendOTP } from '@/lib/otp/sms-provider'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const generateOTPSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  purpose: z.enum(['REDEMPTION', 'LOGIN', 'VERIFICATION']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, purpose } = generateOTPSchema.parse(body)

    const code = await generateOTP(phone, purpose)
    await sendOTP(phone, code)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes in seconds
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

Create `src/app/api/otp/verify/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp/otp-service'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const verifyOTPSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  code: z.string().length(6),
  purpose: z.enum(['REDEMPTION', 'LOGIN', 'VERIFICATION']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code, purpose } = verifyOTPSchema.parse(body)

    const isValid = await verifyOTP(phone, code, purpose)

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid OTP',
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## 3️⃣ RATE LIMITING

### Step 1: Install Dependencies
```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Create Rate Limiter
Create `src/lib/rate-limit/rate-limiter.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'
import { AppError } from '../errors'

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// In-memory fallback for development
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

function getInMemoryLimit(key: string, limit: number, window: number): boolean {
  const now = Date.now()
  const record = inMemoryStore.get(key)

  if (!record || now > record.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + window })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function checkRateLimit(
  request: NextRequest,
  identifier: string,
  limit: number = 10,
  window: number = 60000 // 1 minute
): Promise<void> {
  if (!redis) {
    // Development mode - use in-memory
    const allowed = getInMemoryLimit(identifier, limit, window)
    if (!allowed) {
      throw new AppError(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      )
    }
    return
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${window}ms`),
  })

  const { success, reset } = await ratelimit.limit(identifier)

  if (!success) {
    throw new AppError(
      `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
      429,
      'RATE_LIMIT_EXCEEDED'
    )
  }
}

export function getIdentifier(request: NextRequest, prefix: string): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  return `${prefix}:${ip}`
}
```

### Step 3: Apply Rate Limiting
Update endpoints to use rate limiting:
```typescript
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Add rate limiting
    await checkRateLimit(
      request,
      getIdentifier(request, 'earn'),
      10, // 10 requests
      60000 // per minute
    )
    
    // ... rest of code
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## 4️⃣ TRANSACTION IDEMPOTENCY

### Step 1: Add Schema
Already added in comprehensive review.

### Step 2: Create Idempotency Middleware
Create `src/lib/idempotency/idempotency.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../prisma'
import crypto from 'crypto'

const IDEMPOTENCY_KEY_HEADER = 'idempotency-key'
const EXPIRY_HOURS = 24

export async function handleIdempotency(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const idempotencyKey = request.headers.get(IDEMPOTENCY_KEY_HEADER)

  if (!idempotencyKey) {
    // No idempotency key provided, proceed normally
    return handler()
  }

  // Check if we've seen this key before
  const existing = await prisma.idempotencyKey.findUnique({
    where: { key: idempotencyKey },
  })

  if (existing) {
    // Return cached response
    return NextResponse.json(existing.response, {
      status: 200,
      headers: {
        'X-Idempotent-Replay': 'true',
      },
    })
  }

  // Execute the handler
  const response = await handler()
  const responseData = await response.json()

  // Store the response
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + EXPIRY_HOURS)

  const requestBody = await request.text()
  const requestHash = crypto
    .createHash('sha256')
    .update(requestBody)
    .digest('hex')

  await prisma.idempotencyKey.create({
    data: {
      key: idempotencyKey,
      requestHash,
      response: responseData,
      expiresAt,
    },
  })

  return NextResponse.json(responseData, {
    status: response.status,
  })
}
```

### Step 3: Use in Critical Endpoints
```typescript
import { handleIdempotency } from '@/lib/idempotency/idempotency'

export async function POST(request: NextRequest) {
  return handleIdempotency(request, async () => {
    // Your existing transaction logic here
    // ...
    return NextResponse.json({ success: true })
  })
}
```

---

## 5️⃣ ERROR TRACKING (SENTRY)

### Step 1: Install Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Step 2: Configure Sentry
The wizard will create `sentry.client.config.ts` and `sentry.server.config.ts`.

Update `src/lib/errors.ts` to integrate:
```typescript
import * as Sentry from '@sentry/nextjs'

export function handleApiError(error: unknown): NextResponse {
  // Log to Sentry
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      Sentry.captureException(error)
    }
  } else {
    Sentry.captureException(error)
  }

  // ... rest of existing error handling
}
```

---

## 6️⃣ DATABASE BACKUPS

### Step 1: Create Backup Script
Create `scripts/backup-database.sh`:
```bash
#!/bin/bash

# Configuration
DB_NAME="loyalink"
DB_USER="postgres"
BACKUP_DIR="/var/backups/loyalink"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/loyalink_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Step 2: Set Up Cron Job
```bash
# Run daily at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh
```

### Step 3: Upload to Cloud Storage (Optional)
```bash
# Add to backup script
aws s3 cp $BACKUP_FILE.gz s3://loyalink-backups/
```

---

## 7️⃣ ENHANCED INPUT VALIDATION

Update `src/lib/validations.ts`:
```typescript
import { z } from 'zod'

// Enhanced phone validation
export const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
  .transform(val => val.trim())

// Enhanced amount validation
export const amountSchema = z.number()
  .positive('Amount must be positive')
  .min(1, 'Minimum amount is ₹1')
  .max(1000000, 'Maximum amount is ₹10,00,000')
  .finite('Amount must be a valid number')

// Enhanced points validation
export const pointsSchema = z.number()
  .int('Points must be a whole number')
  .positive('Points must be positive')
  .min(1, 'Minimum 1 point')
  .max(100000, 'Maximum 1,00,000 points')

// String sanitization
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
}

// Update existing schemas
export const earnTransactionSchema = z.object({
  merchantId: z.string().cuid(),
  customerPhone: phoneSchema,
  customerName: z.string().min(2).max(100).transform(sanitizeString),
  amount: amountSchema,
})

export const redeemTransactionSchema = z.object({
  merchantId: z.string().cuid(),
  customerPhone: phoneSchema,
  pointsToRedeem: pointsSchema,
  otp: z.string().length(6).optional(),
})
```

---

## 8️⃣ API DOCUMENTATION

### Step 1: Install Swagger
```bash
npm install swagger-ui-react swagger-jsdoc
npm install -D @types/swagger-ui-react
```

### Step 2: Create OpenAPI Spec
Create `public/openapi.json`:
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Loyalink API",
    "version": "1.0.0",
    "description": "Loyalty points management system API"
  },
  "servers": [
    {
      "url": "http://localhost:3000/api",
      "description": "Development server"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  },
  "paths": {
    "/auth/login": {
      "post": {
        "summary": "Login user",
        "tags": ["Authentication"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "phone": {
                    "type": "string",
                    "example": "9876543210"
                  },
                  "password": {
                    "type": "string",
                    "example": "password123"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login successful"
          }
        }
      }
    }
  }
}
```

### Step 3: Create Documentation Page
Create `src/app/api-docs/page.tsx`:
```typescript
'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs() {
  return (
    <div className="container mx-auto py-8">
      <SwaggerUI url="/openapi.json" />
    </div>
  )
}
```

---

## 9️⃣ BASIC TESTING

### Step 1: Install Testing Dependencies
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @types/jest ts-jest
```

### Step 2: Configure Jest
Create `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Step 3: Create Sample Tests
Create `src/lib/__tests__/tier-utils.test.ts`:
```typescript
import { calculateTier, getTierBonusRate } from '../tier-utils'

describe('Tier Utils', () => {
  describe('calculateTier', () => {
    it('should return BRONZE for new customers', () => {
      expect(calculateTier(0, 0)).toBe('BRONZE')
    })

    it('should return SILVER for qualifying spend and visits', () => {
      expect(calculateTier(10000, 5)).toBe('SILVER')
    })

    it('should return GOLD for qualifying spend and visits', () => {
      expect(calculateTier(50000, 15)).toBe('GOLD')
    })

    it('should return PLATINUM for qualifying spend and visits', () => {
      expect(calculateTier(100000, 30)).toBe('PLATINUM')
    })
  })

  describe('getTierBonusRate', () => {
    it('should return correct bonus rate for each tier', () => {
      expect(getTierBonusRate('BRONZE')).toBe(0.10)
      expect(getTierBonusRate('SILVER')).toBe(0.12)
      expect(getTierBonusRate('GOLD')).toBe(0.14)
      expect(getTierBonusRate('PLATINUM')).toBe(0.15)
    })
  })
})
```

### Step 4: Add Test Scripts
Update `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🔟 ENVIRONMENT CONFIGURATION

### Step 1: Create Environment Files
Create `.env.example`:
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/loyalink?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# Sentry (Error Tracking)
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"

# Environment
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Step 2: Validate Environment
Create `src/lib/env.ts`:
```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Week 1: Core Security
- [ ] Implement authentication system
- [ ] Add OTP service
- [ ] Set up rate limiting
- [ ] Add transaction idempotency
- [ ] Protect all endpoints with auth

### Week 2: Monitoring & Quality
- [ ] Set up Sentry error tracking
- [ ] Configure database backups
- [ ] Enhance input validation
- [ ] Write unit tests (70% coverage)
- [ ] Create API documentation

### Week 3: Testing & Polish
- [ ] Integration tests for critical flows
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation review
- [ ] Production deployment prep

---

## 🚀 DEPLOYMENT CHECKLIST

Before going to production:

- [ ] All P0 features implemented
- [ ] Environment variables configured
- [ ] Database migration run successfully
- [ ] SSL certificate installed
- [ ] Backup system tested
- [ ] Monitoring alerts configured
- [ ] Rate limits tuned for production
- [ ] API documentation published
- [ ] Load testing completed
- [ ] Security audit passed

---

## 📞 SUPPORT

For implementation questions or issues:
1. Review the comprehensive documentation
2. Check API documentation at `/api-docs`
3. Review error logs in Sentry
4. Check database health at `/api/health`

---

**Estimated Implementation Time: 2-3 weeks with 2 developers**

**Priority Order:**
1. Authentication (Days 1-3)
2. OTP Service (Days 4-5)
3. Rate Limiting (Day 6)
4. Idempotency (Day 7)
5. Error Tracking (Day 8)
6. Backups (Day 9)
7. Validation (Day 10)
8. Documentation (Days 11-12)
9. Testing (Days 13-15)
10. Environment Setup (Day 16)

Good luck with your implementation! 🎉
