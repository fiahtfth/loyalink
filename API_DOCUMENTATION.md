# 📚 LOYALINK API Documentation

Complete API reference for the LOYALINK rewards platform.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

## Authentication

Currently, the API does not require authentication. In production, consider implementing API keys or JWT tokens.

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [ ... ] // For validation errors
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 🏥 Health Check

### Check System Health

**Endpoint:** `GET /api/health`

**Description:** Check if the API and database are operational.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-14T00:00:00.000Z",
  "database": "connected",
  "environment": "production"
}
```

---

## 👥 Customers

### List All Customers

**Endpoint:** `GET /api/customers`

**Description:** Retrieve a list of all customers.

**Response:**
```json
[
  {
    "id": "clx123abc",
    "name": "Anita Desai",
    "phone": "8765432100",
    "totalPoints": 150.5,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "_count": {
      "transactions": 10,
      "redemptions": 2
    }
  }
]
```

### Create or Get Customer

**Endpoint:** `POST /api/customers`

**Description:** Create a new customer or return existing customer by phone.

**Request Body:**
```json
{
  "name": "Anita Desai",
  "phone": "8765432100"
}
```

**Validation:**
- `name`: 2-100 characters
- `phone`: Valid Indian phone number (10 digits, starts with 6-9)

**Response:** `201 Created` or `200 OK`
```json
{
  "id": "clx123abc",
  "name": "Anita Desai",
  "phone": "8765432100",
  "totalPoints": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Customer by Phone

**Endpoint:** `GET /api/customers/[phone]`

**Description:** Retrieve a specific customer by phone number.

**Example:** `GET /api/customers/8765432100`

**Response:**
```json
{
  "id": "clx123abc",
  "name": "Anita Desai",
  "phone": "8765432100",
  "totalPoints": 150.5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### Get Customer Statistics

**Endpoint:** `GET /api/customers/[phone]/stats`

**Description:** Get detailed statistics for a customer.

**Example:** `GET /api/customers/8765432100/stats`

**Response:**
```json
{
  "customer": {
    "id": "clx123abc",
    "name": "Anita Desai",
    "phone": "8765432100",
    "totalPoints": 150.5,
    "memberSince": "2024-01-01T00:00:00.000Z"
  },
  "stats": {
    "totalTransactions": 10,
    "totalRedemptions": 2,
    "totalPointsEarned": 200,
    "totalPointsRedeemed": 49.5,
    "currentPoints": 150.5,
    "totalSpent": 20000,
    "averageTransactionValue": 2000,
    "merchantsVisited": 5
  },
  "recentTransactions": [...],
  "recentRedemptions": [...],
  "favoritesMerchants": [...]
}
```

---

## 🏪 Merchants

### List All Merchants

**Endpoint:** `GET /api/merchants`

**Description:** Retrieve a list of all merchants.

**Response:**
```json
[
  {
    "id": "clx456def",
    "name": "Rajesh Kumar",
    "shopName": "Kumar General Store",
    "phone": "9876543210",
    "category": "Kirana Store",
    "address": "123 Main Street, Mumbai",
    "walletBalance": 10000,
    "pointsRate": 1,
    "isActive": true,
    "qrCode": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "transactions": 50,
      "redemptions": 10
    }
  }
]
```

### Create Merchant

**Endpoint:** `POST /api/merchants`

**Description:** Register a new merchant.

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "shopName": "Kumar General Store",
  "phone": "9876543210",
  "category": "Kirana Store",
  "address": "123 Main Street, Mumbai",
  "pointsRate": 1
}
```

**Validation:**
- `name`: 2-100 characters
- `shopName`: 2-200 characters
- `phone`: Valid Indian phone number
- `category`: 2-100 characters
- `address`: 5-500 characters
- `pointsRate`: 0.1-10 (default: 1)

**Response:** `201 Created`
```json
{
  "id": "clx456def",
  "name": "Rajesh Kumar",
  "shopName": "Kumar General Store",
  "phone": "9876543210",
  "category": "Kirana Store",
  "address": "123 Main Street, Mumbai",
  "walletBalance": 0,
  "pointsRate": 1,
  "isActive": true,
  "qrCode": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Merchant by ID

**Endpoint:** `GET /api/merchants/[id]`

**Description:** Retrieve a specific merchant.

**Example:** `GET /api/merchants/clx456def`

**Response:**
```json
{
  "id": "clx456def",
  "name": "Rajesh Kumar",
  "shopName": "Kumar General Store",
  "phone": "9876543210",
  "category": "Kirana Store",
  "address": "123 Main Street, Mumbai",
  "walletBalance": 10000,
  "pointsRate": 1,
  "isActive": true,
  "qrCode": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Merchant Wallet

**Endpoint:** `POST /api/merchants/[id]/wallet`

**Description:** Add or deduct funds from merchant wallet.

**Request Body:**
```json
{
  "amount": 5000,
  "type": "ADD"
}
```

**Validation:**
- `amount`: 1-1,000,000
- `type`: "ADD" or "DEDUCT"

**Response:**
```json
{
  "id": "clx456def",
  "walletBalance": 15000,
  ...
}
```

### Get Merchant Statistics

**Endpoint:** `GET /api/merchants/[id]/stats`

**Description:** Get detailed statistics and analytics for a merchant.

**Example:** `GET /api/merchants/clx456def/stats`

**Response:**
```json
{
  "merchant": {
    "id": "clx456def",
    "shopName": "Kumar General Store",
    "category": "Kirana Store",
    "walletBalance": 10000,
    "isActive": true
  },
  "stats": {
    "totalTransactions": 50,
    "totalRedemptions": 10,
    "totalPointsDistributed": 500,
    "totalPointsRedeemed": 100,
    "totalRevenue": 50000,
    "averageTransactionValue": 1000
  },
  "recentTransactions": [...],
  "topCustomers": [...]
}
```

---

## 💳 Transactions

### List Transactions

**Endpoint:** `GET /api/transactions`

**Description:** Get transaction history with optional filters.

**Query Parameters:**
- `merchantId` (optional): Filter by merchant ID
- `customerId` (optional): Filter by customer ID
- `type` (optional): Filter by type ("EARN" or "REDEEM")
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:** `GET /api/transactions?merchantId=clx456def&limit=20`

**Response:**
```json
{
  "transactions": [
    {
      "id": "clx789ghi",
      "merchantId": "clx456def",
      "customerId": "clx123abc",
      "amount": 500,
      "pointsEarned": 5,
      "type": "EARN",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "merchant": {
        "id": "clx456def",
        "shopName": "Kumar General Store",
        "category": "Kirana Store"
      },
      "customer": {
        "id": "clx123abc",
        "name": "Anita Desai",
        "phone": "8765432100"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Earn Points (Purchase)

**Endpoint:** `POST /api/transactions/earn`

**Description:** Record a purchase and award points to customer.

**Request Body:**
```json
{
  "merchantId": "clx456def",
  "customerPhone": "8765432100",
  "customerName": "Anita Desai",
  "amount": 500
}
```

**Validation:**
- `merchantId`: Valid CUID
- `customerPhone`: Valid Indian phone number
- `customerName`: 2-100 characters
- `amount`: 1-1,000,000

**Business Logic:**
- Points = (amount / 100) × merchant.pointsRate
- Merchant must be active
- Merchant wallet must have sufficient balance
- Customer is created if doesn't exist

**Response:** `201 Created`
```json
{
  "success": true,
  "transaction": {
    "id": "clx789ghi",
    "merchantId": "clx456def",
    "customerId": "clx123abc",
    "amount": 500,
    "pointsEarned": 5,
    "type": "EARN",
    "createdAt": "2024-01-15T00:00:00.000Z"
  },
  "pointsEarned": 5,
  "newTotalPoints": 155.5,
  "message": "Earned 5 points at Kumar General Store!"
}
```

**Error Responses:**
- `404`: Merchant not found
- `400`: Merchant not active
- `400`: Insufficient wallet balance

### Redeem Points

**Endpoint:** `POST /api/transactions/redeem`

**Description:** Redeem customer points for discount.

**Request Body:**
```json
{
  "merchantId": "clx456def",
  "customerPhone": "8765432100",
  "pointsToRedeem": 50
}
```

**Validation:**
- `merchantId`: Valid CUID
- `customerPhone`: Valid Indian phone number
- `pointsToRedeem`: 1-100,000 (integer)

**Business Logic:**
- 1 point = ₹1 discount
- Merchant must be active
- Customer must exist
- Customer must have sufficient points

**Response:** `201 Created`
```json
{
  "success": true,
  "redemption": {
    "id": "clx999jkl",
    "merchantId": "clx456def",
    "customerId": "clx123abc",
    "pointsUsed": 50,
    "discount": 50,
    "createdAt": "2024-01-15T00:00:00.000Z"
  },
  "discount": 50,
  "remainingPoints": 105.5,
  "message": "Redeemed 50 points for ₹50 discount at Kumar General Store!"
}
```

**Error Responses:**
- `404`: Merchant not found
- `404`: Customer not found
- `400`: Merchant not active
- `400`: Insufficient points

---

## 📊 Points Calculation

### Earning Points

**Formula:** `points = (amount / 100) × pointsRate`

**Examples:**
- Purchase ₹500 at 1x rate = 5 points
- Purchase ₹300 at 1.5x rate = 4.5 points
- Purchase ₹1000 at 2x rate = 20 points

### Redeeming Points

**Formula:** `discount = points × 1`

**Examples:**
- Redeem 50 points = ₹50 discount
- Redeem 100 points = ₹100 discount

---

## 🔒 Error Codes

| Code | Description |
|------|-------------|
| `MERCHANT_NOT_FOUND` | Merchant ID doesn't exist |
| `CUSTOMER_NOT_FOUND` | Customer phone doesn't exist |
| `MERCHANT_INACTIVE` | Merchant account is disabled |
| `INSUFFICIENT_WALLET_BALANCE` | Merchant can't afford rewards |
| `INSUFFICIENT_POINTS` | Customer doesn't have enough points |
| `INSUFFICIENT_BALANCE` | Wallet operation would result in negative balance |

---

## 📝 Usage Examples

### Complete Flow: Customer Makes Purchase

```bash
# 1. Create/Get Customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anita Desai",
    "phone": "8765432100"
  }'

# 2. Record Purchase and Earn Points
curl -X POST http://localhost:3000/api/transactions/earn \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "clx456def",
    "customerPhone": "8765432100",
    "customerName": "Anita Desai",
    "amount": 500
  }'

# 3. Check Customer Points
curl http://localhost:3000/api/customers/8765432100

# 4. Redeem Points
curl -X POST http://localhost:3000/api/transactions/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "clx456def",
    "customerPhone": "8765432100",
    "pointsToRedeem": 50
  }'
```

### Merchant Dashboard Data

```bash
# Get merchant statistics
curl http://localhost:3000/api/merchants/clx456def/stats

# Get transaction history
curl "http://localhost:3000/api/transactions?merchantId=clx456def&limit=20"

# Add funds to wallet
curl -X POST http://localhost:3000/api/merchants/clx456def/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "ADD"
  }'
```

---

## 🚀 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 60 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

**Response when rate limited:**
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 30
}
```

---

## 🔧 Development Tools

### Seed Database

```bash
npm run db:seed
```

### Reset Database

```bash
npm run db:reset
```

### View Database

```bash
npx prisma studio
```

---

## 📞 Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- Use the health check endpoint to verify system status

---

**Last Updated**: December 14, 2024
**API Version**: 1.0.0
