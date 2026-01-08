# Prisma Database Schema Documentation

## Overview

This database schema implements a **coalition loyalty platform** with a robust **double-entry accounting system** as outlined in the Strategic Framework. The schema supports:

- Multi-tenant loyalty program across malls, merchants, and customers
- Double-entry accounting for financial integrity
- Settlement management with configurable cycles (T+1 to NET-45)
- Fraud prevention through velocity limits and escrow
- WhatsApp-first integration
- Comprehensive audit trails

## Core Entities

### 1. Mall
Represents shopping malls or retail clusters participating in the coalition.

**Key Fields:**
- `bonusWallet`: Mall's fund for customer bonuses
- `bonusRate`: Percentage bonus on mall-wide redemptions (default 10%)
- `bonusEnabled`: Toggle for mall bonus program

**Relations:**
- One-to-many with Merchants
- One-to-many with Ledger entries

### 2. Merchant
Individual retail businesses participating in the loyalty program.

**Key Fields:**
- `category`: Business category (Fashion, F&B, Grocery, Electronics)
- `walletBalance`: Pre-funded balance for point issuance
- `settlementRate`: Percentage of redeemed points paid to merchant (default 85%)
- `settlementCycle`: Payment frequency (T_PLUS_1, T_PLUS_7, NET_30, etc.)
- `qrCode`: Static QR for WhatsApp-based transactions

**Settlement Cycles:**
- `T_PLUS_1`: Daily (street vendors, high liquidity needs)
- `T_PLUS_3`: 3-day cycle
- `T_PLUS_7`: Weekly (fashion/retail, accounts for returns)
- `NET_30`: Monthly (corporate anchors)
- `NET_45`: 45-day (large corporates)

### 3. Customer
End-users earning and redeeming loyalty points.

**Key Fields:**
- `totalPoints`: Current point balance (denormalized for quick access)
- `phone`: Primary identifier (linked to WhatsApp)

**Relations:**
- One-to-many with Transactions
- One-to-many with Redemptions
- One-to-many with CustomerTiers (per-merchant relationship)

### 4. CustomerTier
Tracks customer relationship with individual merchants.

**Tiers:** BRONZE → SILVER → GOLD → PLATINUM

**Key Fields:**
- `totalSpent`: Lifetime spend at this merchant
- `totalVisits`: Visit frequency
- `tierBonusRate`: Additional bonus for "home store" redemptions (default 10%)

**Use Case:** A customer who frequently shops at Raymond (GOLD tier) gets 10% bonus points when redeeming at Raymond vs. other stores.

## Double-Entry Accounting System

### Architecture (Section 3 of Strategic Framework)

The system implements **immutable ledger accounting** to prevent money creation bugs and ensure audit integrity.

### Account Model
Represents financial accounts for all entities.

**Account Types:**
- `USER_WALLET`: Customer's point balance
- `MERCHANT_PREPAID`: Merchant's pre-funded cash wallet
- `MERCHANT_PAYABLE`: Platform owes merchant (for redemptions)
- `MERCHANT_RECEIVABLE`: Merchant owes platform (issuance fees)
- `PLATFORM_REVENUE`: Platform's earned revenue
- `PLATFORM_LIABILITY`: Platform's liability to users (issued points)
- `PLATFORM_ESCROW`: Escrow for unredeemed points
- `MALL_WALLET`: Mall's bonus fund

**Currencies:**
- `INR`: Indian Rupees (stored as paise in BigInt)
- `PTS`: Loyalty Points (stored as integer)

### JournalEntry Model
Represents a complete financial transaction.

**Key Fields:**
- `timestamp`: Transaction time (UTC)
- `description`: Human-readable description
- `referenceId`: External reference (POS bill, transaction ID)
- `referenceType`: TRANSACTION, REDEMPTION, SETTLEMENT

### Posting Model
Individual legs of a journal entry (debits and credits).

**Key Fields:**
- `amount`: Signed BigInt (positive = credit, negative = debit)
- `currency`: INR or PTS

**Example Transaction - Point Redemption:**

```
User redeems 100 points (₹100 value) at Starbucks:

Journal Entry: "Redemption at Starbucks Sector 18"
├─ Posting 1: Debit USER_WALLET (Customer) -100 PTS
└─ Posting 2: Credit MERCHANT_PAYABLE (Starbucks) +10000 INR (₹100 in paise)
```

**Accounting Equation:** Sum of all postings in a journal entry = 0 (in value terms)

## Settlement Management

### Settlement Model
Tracks periodic payouts to merchants.

**Key Fields:**
- `settlementCycle`: T_PLUS_1, T_PLUS_7, NET_30, etc.
- `periodStart` / `periodEnd`: Settlement period
- `totalRedemptions`: Total points redeemed in period
- `settlementAmount`: Actual cash to pay (totalRedemptions × settlementRate)
- `status`: PENDING → PROCESSING → COMPLETED / FAILED
- `upiTransactionId`: UPI reference for payment

**Settlement Flow:**
1. System aggregates redemptions for period
2. Calculates `settlementAmount = totalRedemptions × merchant.settlementRate`
3. Creates Settlement record with status PENDING
4. Processes UPI payout via Razorpay/Cashfree
5. Updates status to COMPLETED with `upiTransactionId`

## Fraud Prevention

### VelocityLimit Model
Prevents collusion fraud (merchant + customer faking transactions).

**Control:** User cannot earn points from same merchant more than 2x per day.

**Key Fields:**
- `earnCount`: Number of earn transactions today
- `lastEarnAt`: Timestamp of last earn
- `transactionDate`: Date for daily reset

### EscrowedPoints Model
Holds points during return window for high-value purchases.

**Control:** Points earned on items >₹2000 remain in PENDING state for 14 days.

**Key Fields:**
- `releaseDate`: When points become available
- `status`: PENDING → RELEASED / CLAWED_BACK

**Use Case:** User buys ₹5000 shirt, earns 250 points. Points are escrowed. If user returns shirt within 14 days, points are CLAWED_BACK.

## WhatsApp Integration

### WhatsAppSession Model
Tracks conversation state for WhatsApp Business API.

**Key Fields:**
- `sessionId`: Unique session identifier
- `context`: JSON storing conversation state (e.g., pending redemption amount)
- `lastMessageAt`: For session timeout management

### OTPVerification Model
Manages OTP-based verification for high-value redemptions.

**Key Fields:**
- `purpose`: REDEMPTION, REGISTRATION, etc.
- `referenceId`: Links to Transaction/Redemption
- `expiresAt`: OTP validity (typically 5 minutes)

**Flow:**
1. User initiates redemption >₹500
2. System generates OTP, sends via WhatsApp
3. User replies with OTP
4. System verifies and completes redemption

## Category-Based Earn Rates

### CategoryEarnRate Model
Configures earn rates based on merchant category and margin profile.

**Margin Profiles:**
- `HIGH` (50%+): Fashion, Lifestyle → 2-5% earn rate
- `MEDIUM` (30-60%): F&B, Restaurants → 3-10% earn rate
- `LOW` (15-20%): Grocery, Hypermarket → 0.5-1% earn rate

**Key Fields:**
- `earnRate`: Points per ₹100 spent
- `issuanceFee`: Platform fee (1.5-3%)
- `marginProfile`: HIGH, MEDIUM, LOW

**Example:**
```
Category: Fashion
Earn Rate: 5.0 (5 points per ₹100)
Issuance Fee: 0.03 (3%)
Margin Profile: HIGH

Customer spends ₹1000 at Pantaloons:
- Earns: 50 points
- Merchant pays: ₹50 + (₹50 × 3%) = ₹51.50
```

## Legacy Models

### Transaction Model
Simple transaction log (legacy, pre-double-entry).

**Types:**
- `EARN`: Points earned on purchase
- `REDEEM`: Points redeemed for discount

**Note:** New implementations should use JournalEntry + Posting for full audit trail.

### Ledger Model
Legacy single-entry ledger (kept for backward compatibility).

**Entry Types:**
- `EARN`: Points earned
- `REDEEM`: Points redeemed
- `HOME_STORE_BONUS`: Bonus for redeeming at earn location
- `TIER_BONUS`: Tier-based bonus
- `MALL_BONUS`: Mall-wide bonus

## Database Migrations

### Creating Migrations

```bash
# Generate migration after schema changes
npx prisma migrate dev --name descriptive_migration_name

# Apply migrations to production
npx prisma migrate deploy
```

### Important Notes

1. **BigInt for Money:** All monetary amounts use `BigInt` to avoid floating-point errors
2. **Indexes:** Critical indexes on foreign keys, timestamps, and query-heavy fields
3. **Unique Constraints:** Prevent duplicate accounts, sessions, and velocity records
4. **Enums:** Type-safe status and category fields

## Best Practices

### 1. Always Use Double-Entry for Financial Transactions
```typescript
// ❌ Bad: Direct balance update
await prisma.customer.update({
  where: { id: customerId },
  data: { totalPoints: { increment: 100 } }
});

// ✅ Good: Double-entry journal
await createJournalEntry({
  description: "Points earned at Starbucks",
  postings: [
    { accountId: platformLiabilityAccount, amount: 100, currency: 'PTS' },
    { accountId: userWalletAccount, amount: -100, currency: 'PTS' }
  ]
});
```

### 2. Use Transactions for Atomic Operations
```typescript
await prisma.$transaction(async (tx) => {
  // Create journal entry
  const journal = await tx.journalEntry.create({ ... });
  
  // Create postings
  await tx.posting.createMany({ ... });
  
  // Update denormalized balances
  await tx.customer.update({ ... });
});
```

### 3. Implement Row-Level Locking for Concurrency
```typescript
// Prevent double-spending
const customer = await prisma.$queryRaw`
  SELECT * FROM "Customer" 
  WHERE id = ${customerId} 
  FOR UPDATE
`;
```

## Schema Diagram

```
Mall
 ├─ Merchants (1:N)
 │   ├─ Transactions (1:N)
 │   ├─ Redemptions (1:N)
 │   ├─ Settlements (1:N)
 │   └─ CustomerTiers (1:N)
 └─ Ledger Entries (1:N)

Customer
 ├─ Transactions (1:N)
 ├─ Redemptions (1:N)
 ├─ CustomerTiers (1:N)
 └─ Ledger Entries (1:N)

Account
 └─ Postings (1:N)
     └─ JournalEntry (N:1)

Settlement
 └─ Merchant (N:1)

VelocityLimit
 ├─ Customer (N:1)
 └─ Merchant (N:1)
```

## References

- Strategic Framework: `/docs/STRATEGIC_FRAMEWORK.md`
- API Documentation: `/API_DOCUMENTATION.md`
- Deployment Guide: `/DEPLOYMENT.md`
