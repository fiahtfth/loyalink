import { z } from "zod";

export const phoneRegex = /^[6-9]\d{9}$/;

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(phoneRegex, "Invalid Indian phone number"),
});

export const merchantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  shopName: z.string().min(2, "Shop name must be at least 2 characters").max(200),
  phone: z.string().regex(phoneRegex, "Invalid Indian phone number"),
  category: z.string().min(2).max(100),
  address: z.string().min(5).max(500),
  mallId: z.string().min(1).optional(),
  settlementRate: z.number().min(0.8).max(0.9).default(0.85),
});

export const mallSchema = z.object({
  name: z.string().min(2).max(200),
  location: z.string().min(5).max(500),
  bonusRate: z.number().min(0).max(0.2).default(0.10),
  bonusEnabled: z.boolean().default(false),
});

export const earnTransactionSchema = z.object({
  merchantId: z.string().min(1),
  customerPhone: z.string().regex(phoneRegex, "Invalid Indian phone number"),
  customerName: z.string().min(2).max(100),
  amount: z.number().positive().min(1).max(1000000),
});

export const redeemTransactionSchema = z.object({
  merchantId: z.string().min(1),
  customerPhone: z.string().regex(phoneRegex, "Invalid Indian phone number"),
  pointsToRedeem: z.number().positive().int().min(1).max(100000),
  otp: z.string().length(6).optional(),
});

export const walletUpdateSchema = z.object({
  amount: z.number().positive().min(1).max(1000000),
  type: z.enum(["ADD", "DEDUCT"]),
});

export const categoryEarnRateSchema = z.object({
  category: z.string().min(2).max(100),
  earnRate: z.number().min(0.1).max(10),
});

// Partial update schemas — restrict which fields can be modified via PATCH
// to prevent tampering with sensitive fields like walletBalance.
export const merchantUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  shopName: z.string().min(2).max(200).optional(),
  phone: z.string().regex(phoneRegex).optional(),
  category: z.string().min(2).max(100).optional(),
  address: z.string().min(5).max(500).optional(),
  mallId: z.string().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  settlementRate: z.number().min(0.8).max(0.9).optional(),
}).strict();

export const mallUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  location: z.string().min(5).max(500).optional(),
  bonusRate: z.number().min(0).max(0.2).optional(),
  bonusEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type CustomerInput = z.infer<typeof customerSchema>;
export type MerchantInput = z.infer<typeof merchantSchema>;
export type MallInput = z.infer<typeof mallSchema>;
export type EarnTransactionInput = z.infer<typeof earnTransactionSchema>;
export type RedeemTransactionInput = z.infer<typeof redeemTransactionSchema>;
export type WalletUpdateInput = z.infer<typeof walletUpdateSchema>;
export type CategoryEarnRateInput = z.infer<typeof categoryEarnRateSchema>;
export type MerchantUpdateInput = z.infer<typeof merchantUpdateSchema>;
export type MallUpdateInput = z.infer<typeof mallUpdateSchema>;
