import { prisma } from "./prisma"

export type TierLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

export interface TierThresholds {
  BRONZE: { minSpent: number; minVisits: number; bonusRate: number }
  SILVER: { minSpent: number; minVisits: number; bonusRate: number }
  GOLD: { minSpent: number; minVisits: number; bonusRate: number }
  PLATINUM: { minSpent: number; minVisits: number; bonusRate: number }
}

export const TIER_THRESHOLDS: TierThresholds = {
  BRONZE: { minSpent: 0, minVisits: 0, bonusRate: 0.10 },
  SILVER: { minSpent: 10000, minVisits: 5, bonusRate: 0.12 },
  GOLD: { minSpent: 50000, minVisits: 15, bonusRate: 0.14 },
  PLATINUM: { minSpent: 100000, minVisits: 30, bonusRate: 0.15 },
}

export function calculateTier(totalSpent: number, totalVisits: number): TierLevel {
  if (totalSpent >= TIER_THRESHOLDS.PLATINUM.minSpent && totalVisits >= TIER_THRESHOLDS.PLATINUM.minVisits) {
    return "PLATINUM"
  }
  if (totalSpent >= TIER_THRESHOLDS.GOLD.minSpent && totalVisits >= TIER_THRESHOLDS.GOLD.minVisits) {
    return "GOLD"
  }
  if (totalSpent >= TIER_THRESHOLDS.SILVER.minSpent && totalVisits >= TIER_THRESHOLDS.SILVER.minVisits) {
    return "SILVER"
  }
  return "BRONZE"
}

export function getTierBonusRate(tier: TierLevel): number {
  return TIER_THRESHOLDS[tier].bonusRate
}

export async function updateCustomerTier(
  customerId: string,
  merchantId: string,
  amountSpent: number
) {
  let customerTier = await prisma.customerTier.findUnique({
    where: {
      customerId_merchantId: {
        customerId,
        merchantId,
      },
    },
  })

  if (!customerTier) {
    customerTier = await prisma.customerTier.create({
      data: {
        customerId,
        merchantId,
        totalSpent: amountSpent,
        totalVisits: 1,
        tier: "BRONZE",
        tierBonusRate: TIER_THRESHOLDS.BRONZE.bonusRate,
      },
    })
  } else {
    const newTotalSpent = customerTier.totalSpent + amountSpent
    const newTotalVisits = customerTier.totalVisits + 1
    const newTier = calculateTier(newTotalSpent, newTotalVisits)
    const newBonusRate = getTierBonusRate(newTier)

    customerTier = await prisma.customerTier.update({
      where: {
        customerId_merchantId: {
          customerId,
          merchantId,
        },
      },
      data: {
        totalSpent: newTotalSpent,
        totalVisits: newTotalVisits,
        tier: newTier,
        tierBonusRate: newBonusRate,
      },
    })
  }

  return customerTier
}

export async function getCustomerTierAtMerchant(
  customerId: string,
  merchantId: string
) {
  const tier = await prisma.customerTier.findUnique({
    where: {
      customerId_merchantId: {
        customerId,
        merchantId,
      },
    },
  })

  return tier || {
    tier: "BRONZE",
    tierBonusRate: TIER_THRESHOLDS.BRONZE.bonusRate,
    totalSpent: 0,
    totalVisits: 0,
  }
}
