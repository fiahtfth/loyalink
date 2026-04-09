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
- **⚡ Modern Stack**: Next.js 16, React 19, Supabase, TypeScript, Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

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
   Edit `.env` and add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Initialize the database**
   ```bash
   # Link to your Supabase project
   supabase link --project-ref <your-project-ref>
   
   # Push schema and seed data
   supabase db push --include-all
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
│   └── schema.prisma          # Database schema (for migrations)
├── supabase/
│   └── migrations/            # Supabase migrations
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
│       ├── supabase.ts        # Supabase client
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
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key (client-side)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side)

**Optional:**
- `NODE_ENV`: Environment mode (development/production)
- `SKIP_ENV_VALIDATION`: Skip env validation during build

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Validation**: Zod
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 🔒 Security Features

- ✅ Input validation with Zod schemas
- ✅ SQL injection protection via Supabase
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

3. **Set up Supabase**
   - Create a free Supabase project at https://supabase.com
   - Get your project URL and API keys from Settings → API
   - Run `supabase db push` to deploy the schema

4. **Configure environment variables in Vercel**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

5. **Deploy**
   ```bash
   vercel --prod
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
supabase db push             # Push schema changes to Supabase
supabase db reset            # Reset database and reapply migrations
supabase db seed             # Run seed script
supabase link                # Link to Supabase project
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
