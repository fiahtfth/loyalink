import { prisma } from "./prisma"

export type LedgerEntryType = "EARN" | "REDEEM" | "HOME_STORE_BONUS" | "TIER_BONUS" | "MALL_BONUS"

export interface CreateLedgerEntryParams {
  customerId: string
  merchantId: string
  mallId?: string
  entryType: LedgerEntryType
  points: number
  cashEquivalent: number
  description: string
  metadata?: Record<string, any>
}

export async function createLedgerEntry(params: CreateLedgerEntryParams) {
  return await prisma.ledger.create({
    data: {
      customerId: params.customerId,
      merchantId: params.merchantId,
      mallId: params.mallId,
      entryType: params.entryType,
      points: params.points,
      cashEquivalent: params.cashEquivalent,
      description: params.description,
      metadata: params.metadata || {},
    },
  })
}

export async function getCustomerLedger(
  customerId: string,
  options?: {
    merchantId?: string
    entryType?: LedgerEntryType
    limit?: number
    offset?: number
  }
) {
  const where: any = { customerId }
  if (options?.merchantId) where.merchantId = options.merchantId
  if (options?.entryType) where.entryType = options.entryType

  const [entries, total] = await Promise.all([
    prisma.ledger.findMany({
      where,
      include: {
        merchant: {
          select: {
            shopName: true,
            category: true,
          },
        },
        mall: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.ledger.count({ where }),
  ])

  return { entries, total }
}

export async function getMerchantLedger(
  merchantId: string,
  options?: {
    customerId?: string
    entryType?: LedgerEntryType
    limit?: number
    offset?: number
  }
) {
  const where: any = { merchantId }
  if (options?.customerId) where.customerId = options.customerId
  if (options?.entryType) where.entryType = options.entryType

  const [entries, total] = await Promise.all([
    prisma.ledger.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.ledger.count({ where }),
  ])

  return { entries, total }
}

export async function getMallLedger(
  mallId: string,
  options?: {
    entryType?: LedgerEntryType
    limit?: number
    offset?: number
  }
) {
  const where: any = { mallId }
  if (options?.entryType) where.entryType = options.entryType

  const [entries, total] = await Promise.all([
    prisma.ledger.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        merchant: {
          select: {
            shopName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.ledger.count({ where }),
  ])

  return { entries, total }
}
