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
  mallId: z.string().cuid().optional(),
  settlementRate: z.number().min(0.8).max(0.9).default(0.85),
});

export const mallSchema = z.object({
  name: z.string().min(2).max(200),
  location: z.string().min(5).max(500),
  bonusRate: z.number().min(0).max(0.2).default(0.10),
  bonusEnabled: z.boolean().default(false),
});

export const earnTransactionSchema = z.object({
  merchantId: z.string().cuid(),
  customerPhone: z.string().regex(phoneRegex, "Invalid Indian phone number"),
  customerName: z.string().min(2).max(100),
  amount: z.number().positive().min(1).max(1000000),
});

export const redeemTransactionSchema = z.object({
  merchantId: z.string().cuid(),
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

export type CustomerInput = z.infer<typeof customerSchema>;
export type MerchantInput = z.infer<typeof merchantSchema>;
export type MallInput = z.infer<typeof mallSchema>;
export type EarnTransactionInput = z.infer<typeof earnTransactionSchema>;
export type RedeemTransactionInput = z.infer<typeof redeemTransactionSchema>;
export type WalletUpdateInput = z.infer<typeof walletUpdateSchema>;
export type CategoryEarnRateInput = z.infer<typeof categoryEarnRateSchema>;
