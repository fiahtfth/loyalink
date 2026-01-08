-- CreateEnum
CREATE TYPE "AccountHolderType" AS ENUM ('USER', 'MERCHANT', 'MALL', 'PLATFORM');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER_WALLET', 'MERCHANT_PREPAID', 'MERCHANT_PAYABLE', 'MERCHANT_RECEIVABLE', 'PLATFORM_REVENUE', 'PLATFORM_LIABILITY', 'PLATFORM_ESCROW', 'MALL_WALLET');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'PTS');

-- CreateEnum
CREATE TYPE "SettlementCycle" AS ENUM ('T_PLUS_1', 'T_PLUS_3', 'T_PLUS_7', 'NET_30', 'NET_45');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('PENDING', 'RELEASED', 'CLAWED_BACK');

-- CreateTable
CREATE TABLE "Mall" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "bonusWallet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bonusRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mallId" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "settlementRate" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "settlementCycle" "SettlementCycle" NOT NULL DEFAULT 'T_PLUS_7',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerTier" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'BRONZE',
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "tierBonusRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "pointsEarned" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "earnMerchantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redemption" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "pointsUsed" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "settlementAmount" DOUBLE PRECISION NOT NULL,
    "isHomeStore" BOOLEAN NOT NULL DEFAULT false,
    "homeStoreBonusPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tierBonusPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mallBonusPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "holderId" TEXT NOT NULL,
    "holderType" "AccountHolderType" NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posting" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" "Currency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Posting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "settlementCycle" "SettlementCycle" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalRedemptions" DOUBLE PRECISION NOT NULL,
    "settlementAmount" DOUBLE PRECISION NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "upiTransactionId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VelocityLimit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "earnCount" INTEGER NOT NULL DEFAULT 0,
    "lastEarnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VelocityLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowedPoints" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowedPoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppSession" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "merchantId" TEXT,
    "phone" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "referenceId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "mallId" TEXT,
    "entryType" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "cashEquivalent" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryEarnRate" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "earnRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "marginProfile" TEXT NOT NULL DEFAULT 'MEDIUM',
    "issuanceFee" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryEarnRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mall_isActive_idx" ON "Mall"("isActive");

-- CreateIndex
CREATE INDEX "Mall_createdAt_idx" ON "Mall"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_phone_key" ON "Merchant"("phone");

-- CreateIndex
CREATE INDEX "Merchant_category_idx" ON "Merchant"("category");

-- CreateIndex
CREATE INDEX "Merchant_isActive_idx" ON "Merchant"("isActive");

-- CreateIndex
CREATE INDEX "Merchant_createdAt_idx" ON "Merchant"("createdAt");

-- CreateIndex
CREATE INDEX "Merchant_mallId_idx" ON "Merchant"("mallId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt");

-- CreateIndex
CREATE INDEX "Customer_totalPoints_idx" ON "Customer"("totalPoints");

-- CreateIndex
CREATE INDEX "CustomerTier_customerId_idx" ON "CustomerTier"("customerId");

-- CreateIndex
CREATE INDEX "CustomerTier_merchantId_idx" ON "CustomerTier"("merchantId");

-- CreateIndex
CREATE INDEX "CustomerTier_tier_idx" ON "CustomerTier"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerTier_customerId_merchantId_key" ON "CustomerTier"("customerId", "merchantId");

-- CreateIndex
CREATE INDEX "Transaction_merchantId_idx" ON "Transaction"("merchantId");

-- CreateIndex
CREATE INDEX "Transaction_customerId_idx" ON "Transaction"("customerId");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_earnMerchantId_idx" ON "Transaction"("earnMerchantId");

-- CreateIndex
CREATE INDEX "Redemption_merchantId_idx" ON "Redemption"("merchantId");

-- CreateIndex
CREATE INDEX "Redemption_customerId_idx" ON "Redemption"("customerId");

-- CreateIndex
CREATE INDEX "Redemption_createdAt_idx" ON "Redemption"("createdAt");

-- CreateIndex
CREATE INDEX "Redemption_isHomeStore_idx" ON "Redemption"("isHomeStore");

-- CreateIndex
CREATE INDEX "Account_holderId_idx" ON "Account"("holderId");

-- CreateIndex
CREATE INDEX "Account_holderType_idx" ON "Account"("holderType");

-- CreateIndex
CREATE INDEX "Account_accountType_idx" ON "Account"("accountType");

-- CreateIndex
CREATE UNIQUE INDEX "Account_holderId_accountType_currency_key" ON "Account"("holderId", "accountType", "currency");

-- CreateIndex
CREATE INDEX "JournalEntry_timestamp_idx" ON "JournalEntry"("timestamp");

-- CreateIndex
CREATE INDEX "JournalEntry_referenceId_idx" ON "JournalEntry"("referenceId");

-- CreateIndex
CREATE INDEX "JournalEntry_referenceType_idx" ON "JournalEntry"("referenceType");

-- CreateIndex
CREATE INDEX "Posting_journalId_idx" ON "Posting"("journalId");

-- CreateIndex
CREATE INDEX "Posting_accountId_idx" ON "Posting"("accountId");

-- CreateIndex
CREATE INDEX "Posting_createdAt_idx" ON "Posting"("createdAt");

-- CreateIndex
CREATE INDEX "Settlement_merchantId_idx" ON "Settlement"("merchantId");

-- CreateIndex
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- CreateIndex
CREATE INDEX "Settlement_periodEnd_idx" ON "Settlement"("periodEnd");

-- CreateIndex
CREATE INDEX "Settlement_createdAt_idx" ON "Settlement"("createdAt");

-- CreateIndex
CREATE INDEX "VelocityLimit_customerId_idx" ON "VelocityLimit"("customerId");

-- CreateIndex
CREATE INDEX "VelocityLimit_merchantId_idx" ON "VelocityLimit"("merchantId");

-- CreateIndex
CREATE INDEX "VelocityLimit_transactionDate_idx" ON "VelocityLimit"("transactionDate");

-- CreateIndex
CREATE UNIQUE INDEX "VelocityLimit_customerId_merchantId_transactionDate_key" ON "VelocityLimit"("customerId", "merchantId", "transactionDate");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowedPoints_transactionId_key" ON "EscrowedPoints"("transactionId");

-- CreateIndex
CREATE INDEX "EscrowedPoints_customerId_idx" ON "EscrowedPoints"("customerId");

-- CreateIndex
CREATE INDEX "EscrowedPoints_merchantId_idx" ON "EscrowedPoints"("merchantId");

-- CreateIndex
CREATE INDEX "EscrowedPoints_releaseDate_idx" ON "EscrowedPoints"("releaseDate");

-- CreateIndex
CREATE INDEX "EscrowedPoints_status_idx" ON "EscrowedPoints"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppSession_sessionId_key" ON "WhatsAppSession"("sessionId");

-- CreateIndex
CREATE INDEX "WhatsAppSession_phone_idx" ON "WhatsAppSession"("phone");

-- CreateIndex
CREATE INDEX "WhatsAppSession_customerId_idx" ON "WhatsAppSession"("customerId");

-- CreateIndex
CREATE INDEX "WhatsAppSession_merchantId_idx" ON "WhatsAppSession"("merchantId");

-- CreateIndex
CREATE INDEX "WhatsAppSession_lastMessageAt_idx" ON "WhatsAppSession"("lastMessageAt");

-- CreateIndex
CREATE INDEX "OTPVerification_phone_idx" ON "OTPVerification"("phone");

-- CreateIndex
CREATE INDEX "OTPVerification_referenceId_idx" ON "OTPVerification"("referenceId");

-- CreateIndex
CREATE INDEX "OTPVerification_expiresAt_idx" ON "OTPVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "Ledger_customerId_idx" ON "Ledger"("customerId");

-- CreateIndex
CREATE INDEX "Ledger_merchantId_idx" ON "Ledger"("merchantId");

-- CreateIndex
CREATE INDEX "Ledger_mallId_idx" ON "Ledger"("mallId");

-- CreateIndex
CREATE INDEX "Ledger_entryType_idx" ON "Ledger"("entryType");

-- CreateIndex
CREATE INDEX "Ledger_createdAt_idx" ON "Ledger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryEarnRate_category_key" ON "CategoryEarnRate"("category");

-- CreateIndex
CREATE INDEX "CategoryEarnRate_category_idx" ON "CategoryEarnRate"("category");

-- CreateIndex
CREATE INDEX "CategoryEarnRate_isActive_idx" ON "CategoryEarnRate"("isActive");

-- CreateIndex
CREATE INDEX "CategoryEarnRate_marginProfile_idx" ON "CategoryEarnRate"("marginProfile");

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_mallId_fkey" FOREIGN KEY ("mallId") REFERENCES "Mall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTier" ADD CONSTRAINT "CustomerTier_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTier" ADD CONSTRAINT "CustomerTier_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posting" ADD CONSTRAINT "Posting_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posting" ADD CONSTRAINT "Posting_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_mallId_fkey" FOREIGN KEY ("mallId") REFERENCES "Mall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

