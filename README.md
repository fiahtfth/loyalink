# 🔗 LOYALINK

**A Universal Rewards Network for Small Shops**

LOYALINK is a shared rewards platform that enables small businesses to offer loyalty programs without complex infrastructure. Customers earn points at one store and can redeem them at any participating merchant in the network.

## ✨ Features

- **🏪 Merchant Management**: Register shops with QR codes for easy customer scanning
- **👥 Customer Tracking**: Automatic customer profile creation and points management
- **💰 Prepaid Wallet System**: Merchants fund their wallet to distribute rewards
- **📱 QR Code Integration**: Simple scan-to-earn and scan-to-redeem workflow
- **🔄 Universal Redemption**: Points earned at one store can be used at any participating merchant
- **🛡️ Production-Ready**: Built with security, validation, and error handling
- **⚡ Modern Stack**: Next.js 16, React 19, Prisma, TypeScript, Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or SQLite for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loyalink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your `DATABASE_URL`

4. **Initialize the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations (for PostgreSQL)
   npx prisma migrate dev --name init
   
   # OR push schema (for quick setup)
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
loyalink/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── customers/     # Customer endpoints
│   │   │   ├── merchants/     # Merchant endpoints
│   │   │   └── transactions/  # Transaction endpoints
│   │   ├── customers/         # Customer pages
│   │   ├── merchants/         # Merchant pages
│   │   ├── scan/              # QR scanning page
│   │   ├── redeem/            # Redemption page
│   │   ├── error.tsx          # Global error boundary
│   │   ├── not-found.tsx      # 404 page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── navbar.tsx         # Navigation component
│   │   └── qr-display.tsx     # QR code display
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       ├── validations.ts     # Zod schemas
│       ├── errors.ts          # Error handling
│       ├── env.ts             # Environment validation
│       └── utils.ts           # Utility functions
└── middleware.ts              # Security headers
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

**Required:**
- `DATABASE_URL`: PostgreSQL or SQLite connection string

**Optional:**
- `NODE_ENV`: Environment mode (development/production)
- `SKIP_ENV_VALIDATION`: Skip env validation during build

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Validation**: Zod
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand

## 🔒 Security Features

- ✅ Input validation with Zod schemas
- ✅ SQL injection protection via Prisma
- ✅ Security headers (HSTS, CSP, XSS protection)
- ✅ Error handling with sanitized responses
- ✅ Environment variable validation
- ✅ Type-safe API routes

## 📊 Database Schema

### Models

- **Merchant**: Shop information, wallet balance, QR code
- **Customer**: User profile, total points
- **Transaction**: Earn transactions (purchase → points)
- **Redemption**: Redeem transactions (points → discount)

### Key Relationships

- Merchants have many Transactions and Redemptions
- Customers have many Transactions and Redemptions
- Points rate: 1 point per ₹100 spent (configurable per merchant)
- Redemption rate: 1 point = ₹1 discount

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set up Vercel Postgres**
   - Go to your Vercel project dashboard
   - Navigate to Storage → Create Database → Postgres
   - Connect the database to your project
   - The `DATABASE_URL` will be automatically added

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Run migrations**
   ```bash
   # Pull environment variables
   vercel env pull .env.local
   
   # Push database schema
   npx prisma db push
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands

```bash
npx prisma studio              # Open Prisma Studio (DB GUI)
npx prisma migrate dev         # Create and apply migration
npx prisma db push             # Push schema without migration
npx prisma generate            # Generate Prisma Client
npx prisma db seed             # Run seed script (if configured)
```

## 📝 API Documentation

### Customers

- `GET /api/customers` - List all customers
- `POST /api/customers` - Create/get customer
- `GET /api/customers/[phone]` - Get customer by phone

### Merchants

- `GET /api/merchants` - List all merchants
- `POST /api/merchants` - Create merchant
- `GET /api/merchants/[id]` - Get merchant by ID
- `POST /api/merchants/[id]/wallet` - Update wallet balance

### Transactions

- `POST /api/transactions/earn` - Record purchase and earn points
- `POST /api/transactions/redeem` - Redeem points for discount

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the [DEPLOYMENT.md](./DEPLOYMENT.md) guide

## 🎯 Roadmap

- [ ] WhatsApp integration for notifications
- [ ] Analytics dashboard for merchants
- [ ] Mobile app (React Native)
- [ ] Multi-tier loyalty programs
- [ ] Referral system
- [ ] Admin panel

---

**Built with ❤️ for small businesses**
