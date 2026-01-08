-- Insert category earn rates
INSERT INTO "CategoryEarnRate" (id, category, "earnRate", "issuanceFee", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Fashion', 5.0, 0.03, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'F&B', 7.0, 0.02, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Grocery', 0.5, 0.00, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Electronics', 0.3, 0.00, true, NOW(), NOW());

-- Insert a mall
INSERT INTO "Mall" (id, name, location, "bonusWallet", "bonusEnabled", "bonusRate", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Phoenix Marketcity', 'Mumbai', 10000, true, 0.10, true, NOW(), NOW());

-- Insert sample merchants
WITH mall AS (SELECT id FROM "Mall" LIMIT 1)
INSERT INTO "Merchant" (id, name, "shopName", phone, category, address, "mallId", "walletBalance", "settlementRate", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  'Rajesh Kumar',
  'Kumar Fashion Store',
  '9876543210',
  'Fashion',
  'Shop 101, Phoenix Mall',
  mall.id,
  5000,
  0.85,
  true,
  NOW(),
  NOW()
FROM mall;

-- Insert sample customers
INSERT INTO "Customer" (id, name, phone, "totalPoints", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Priya Sharma', '9123456780', 150, NOW(), NOW()),
  (gen_random_uuid()::text, 'Amit Patel', '9123456781', 250, NOW(), NOW());
