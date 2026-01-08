# 🚀 LOYALINK Quick Start Guide

## For Local Development

```bash
# Run the automated setup script
./scripts/setup-local.sh

# Or manually:
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma generate
npx prisma db push
npm run dev
```

Visit: http://localhost:3000

## For Production Deployment

```bash
# Run the automated setup script
./scripts/setup-production.sh

# Or manually follow DEPLOYMENT.md
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx prisma generate      # Regenerate Prisma Client
npx prisma migrate dev   # Create migration

# Deployment
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View deployment logs
vercel env pull          # Pull environment variables
```

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── customers/      # Customer pages
│   ├── merchants/      # Merchant pages
│   └── ...
├── components/         # React components
│   └── ui/            # UI components
└── lib/               # Utilities
    ├── prisma.ts      # Database client
    ├── validations.ts # Input validation
    ├── errors.ts      # Error handling
    └── env.ts         # Environment config
```

## Key Features

- 🏪 Merchant registration with QR codes
- 👥 Customer management
- 💰 Wallet-based rewards system
- 📱 QR code scanning for earn/redeem
- 🔄 Universal point redemption

## API Endpoints

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[phone]` - Get by phone

### Merchants
- `GET /api/merchants` - List merchants
- `POST /api/merchants` - Create merchant
- `POST /api/merchants/[id]/wallet` - Update wallet

### Transactions
- `POST /api/transactions/earn` - Earn points
- `POST /api/transactions/redeem` - Redeem points

### Health
- `GET /api/health` - Health check

## Environment Variables

Required:
- `DATABASE_URL` - Database connection string

Optional:
- `NODE_ENV` - Environment (development/production)
- `SKIP_ENV_VALIDATION` - Skip validation during build

## Documentation

- `README.md` - Full documentation
- `DEPLOYMENT.md` - Deployment guide
- `PRODUCTION_CHECKLIST.md` - Pre-deployment checklist
- `IMPROVEMENTS_SUMMARY.md` - Recent improvements

## Support

- Check the documentation files
- Review API responses for error details
- Use health check endpoint: `/api/health`
- Check Prisma Studio for database issues

## Security Features

✅ Input validation (Zod)
✅ SQL injection protection (Prisma)
✅ Security headers (middleware)
✅ Error sanitization
✅ Environment validation
✅ Type safety (TypeScript)

---

**Need help?** Check README.md for detailed instructions.
