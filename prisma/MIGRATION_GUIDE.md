# Migration Guide: Double-Entry Accounting System

## Overview

This migration adds a comprehensive double-entry accounting system to the Loyalink platform, implementing the financial architecture described in the Strategic Framework.

## New Models Added

### 1. Double-Entry Accounting
- `Account`: Financial accounts for users, merchants, malls, and platform
- `JournalEntry`: Transaction records with metadata
- `Posting`: Individual debits/credits (legs of journal entries)

### 2. Settlement Management
- `Settlement`: Periodic payout tracking for merchants
- Enums: `SettlementCycle`, `SettlementStatus`

### 3. Fraud Prevention
- `VelocityLimit`: Rate limiting for earn transactions
- `EscrowedPoints`: Points held during return windows
- Enum: `EscrowStatus`

### 4. WhatsApp Integration
- `WhatsAppSession`: Conversation state management
- `OTPVerification`: OTP-based verification for high-value transactions

### 5. Enhanced Models
- `CategoryEarnRate`: Added `marginProfile` and `issuanceFee` fields
- `Merchant`: Added `settlementCycle` field

## Migration Steps

### Step 1: Ensure Database is Running

```bash
# If using Docker
docker-compose up -d

# Or start PostgreSQL locally
brew services start postgresql
```

### Step 2: Create Migration

```bash
# Generate migration files
npx prisma migrate dev --name add_double_entry_accounting_and_settlement_system

# This will:
# 1. Create new tables
# 2. Add new columns to existing tables
# 3. Create indexes
# 4. Generate Prisma Client
```

### Step 3: Verify Migration

```bash
# Check migration status
npx prisma migrate status

# View generated SQL
cat prisma/migrations/*/migration.sql
```

### Step 4: Seed Initial Data

```bash
# Run seed script to populate initial accounts and categories
npx prisma db seed
```

## Data Migration Strategy

### Migrating Existing Transactions to Double-Entry

If you have existing data in the `Transaction` and `Redemption` tables, you'll need to backfill the double-entry system:

```typescript
// scripts/migrate-to-double-entry.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTransactions() {
  const transactions = await prisma.transaction.findMany({
    include: { customer: true, merchant: true }
  });

  for (const txn of transactions) {
    // Create platform accounts if they don't exist
    const platformLiability = await getOrCreateAccount({
      holderId: 'PLATFORM',
      holderType: 'PLATFORM',
      accountType: 'PLATFORM_LIABILITY',
      currency: 'PTS'
    });

    const userWallet = await getOrCreateAccount({
      holderId: txn.customerId,
      holderType: 'USER',
      accountType: 'USER_WALLET',
      currency: 'PTS'
    });

    // Create journal entry
    await prisma.journalEntry.create({
      data: {
        description: `Historical earn at ${txn.merchant.shopName}`,
        referenceId: txn.id,
        referenceType: 'TRANSACTION',
        timestamp: txn.createdAt,
        postings: {
          create: [
            {
              accountId: platformLiability.id,
              amount: BigInt(txn.pointsEarned * 100), // Convert to smallest unit
              currency: 'PTS'
            },
            {
              accountId: userWallet.id,
              amount: BigInt(-txn.pointsEarned * 100),
              currency: 'PTS'
            }
          ]
        }
      }
    });
  }
}
```

## Breaking Changes

### 1. Merchant Model
- **Added:** `settlementCycle` field (default: `T_PLUS_7`)
- **Impact:** Existing merchants will default to weekly settlement
- **Action Required:** Update settlement cycles for specific merchant types:
  - Street vendors → `T_PLUS_1`
  - Corporate anchors → `NET_30`

### 2. CategoryEarnRate Model
- **Added:** `marginProfile` and `issuanceFee` fields
- **Impact:** Existing categories will default to `MEDIUM` margin and 2% fee
- **Action Required:** Update categories with correct margin profiles:

```sql
UPDATE "CategoryEarnRate" 
SET "marginProfile" = 'HIGH', "issuanceFee" = 0.03 
WHERE category IN ('Fashion', 'Lifestyle', 'Jewelry');

UPDATE "CategoryEarnRate" 
SET "marginProfile" = 'LOW', "issuanceFee" = 0.00 
WHERE category IN ('Grocery', 'Hypermarket', 'Electronics');
```

## New Enums

### AccountHolderType
- `USER`: Customer accounts
- `MERCHANT`: Merchant accounts
- `MALL`: Mall accounts
- `PLATFORM`: Platform system accounts

### AccountType
- `USER_WALLET`: Customer point balance
- `MERCHANT_PREPAID`: Merchant pre-funded wallet
- `MERCHANT_PAYABLE`: Platform owes merchant
- `MERCHANT_RECEIVABLE`: Merchant owes platform
- `PLATFORM_REVENUE`: Platform revenue
- `PLATFORM_LIABILITY`: Platform liability (issued points)
- `PLATFORM_ESCROW`: Escrow for unredeemed points
- `MALL_WALLET`: Mall bonus wallet

### Currency
- `INR`: Indian Rupees (stored as paise in BigInt)
- `PTS`: Loyalty Points

### SettlementCycle
- `T_PLUS_1`: Daily settlement
- `T_PLUS_3`: 3-day settlement
- `T_PLUS_7`: Weekly settlement
- `NET_30`: Monthly settlement
- `NET_45`: 45-day settlement

### SettlementStatus
- `PENDING`: Awaiting processing
- `PROCESSING`: Payment in progress
- `COMPLETED`: Successfully paid
- `FAILED`: Payment failed
- `DISPUTED`: Under dispute

### EscrowStatus
- `PENDING`: Points held in escrow
- `RELEASED`: Points released to customer
- `CLAWED_BACK`: Points revoked due to return

## Post-Migration Tasks

### 1. Create Platform Accounts

```typescript
// Create system accounts for platform operations
await prisma.account.createMany({
  data: [
    {
      holderId: 'PLATFORM',
      holderType: 'PLATFORM',
      accountType: 'PLATFORM_LIABILITY',
      currency: 'PTS'
    },
    {
      holderId: 'PLATFORM',
      holderType: 'PLATFORM',
      accountType: 'PLATFORM_REVENUE',
      currency: 'INR'
    },
    {
      holderId: 'PLATFORM',
      holderType: 'PLATFORM',
      accountType: 'PLATFORM_ESCROW',
      currency: 'INR'
    }
  ]
});
```

### 2. Update Category Earn Rates

```typescript
// Update with margin-based configurations
const categories = [
  { category: 'Fashion', earnRate: 5.0, marginProfile: 'HIGH', issuanceFee: 0.03 },
  { category: 'F&B', earnRate: 7.0, marginProfile: 'MEDIUM', issuanceFee: 0.02 },
  { category: 'Grocery', earnRate: 0.5, marginProfile: 'LOW', issuanceFee: 0.00 },
  { category: 'Electronics', earnRate: 0.3, marginProfile: 'LOW', issuanceFee: 0.00 }
];

for (const cat of categories) {
  await prisma.categoryEarnRate.upsert({
    where: { category: cat.category },
    update: cat,
    create: cat
  });
}
```

### 3. Initialize Merchant Accounts

```typescript
// Create accounts for all existing merchants
const merchants = await prisma.merchant.findMany();

for (const merchant of merchants) {
  await prisma.account.createMany({
    data: [
      {
        holderId: merchant.id,
        holderType: 'MERCHANT',
        accountType: 'MERCHANT_PREPAID',
        currency: 'INR'
      },
      {
        holderId: merchant.id,
        holderType: 'MERCHANT',
        accountType: 'MERCHANT_PAYABLE',
        currency: 'INR'
      }
    ],
    skipDuplicates: true
  });
}
```

## Rollback Plan

If you need to rollback this migration:

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back <migration_name>

# Or reset database (WARNING: This deletes all data)
npx prisma migrate reset
```

## Testing Checklist

After migration, verify:

- [ ] All existing customers can view their point balances
- [ ] New transactions create proper journal entries
- [ ] Redemptions create correct postings
- [ ] Settlement records are created for merchants
- [ ] Velocity limits prevent fraud
- [ ] Escrowed points are properly tracked
- [ ] WhatsApp sessions are stored correctly
- [ ] OTP verification works for high-value redemptions

## Performance Considerations

### Indexes Added
- All foreign keys are indexed
- Timestamp fields for time-based queries
- Composite indexes for common query patterns

### Query Optimization
```typescript
// Use select to limit fields
const balance = await prisma.customer.findUnique({
  where: { id: customerId },
  select: { totalPoints: true }
});

// Use aggregations for account balances
const accountBalance = await prisma.posting.aggregate({
  where: { accountId: accountId },
  _sum: { amount: true }
});
```

## Support

For issues or questions:
1. Check Prisma schema: `prisma/schema.prisma`
2. Review documentation: `prisma/README.md`
3. See strategic framework: `docs/STRATEGIC_FRAMEWORK.md`
