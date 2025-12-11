# Deployment Guide

## Setting up Vercel Postgres Database

1. **Go to your Vercel project dashboard:**
   - Visit: https://vercel.com/fiahtfth-gmailcoms-projects/loyalink

2. **Add Postgres Database:**
   - Click on the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name (e.g., "loyalink-db")
   - Select a region (choose closest to your users)
   - Click "Create"

3. **Connect Database to Project:**
   - After creation, click "Connect Project"
   - Select your "loyalink" project
   - Click "Connect"
   - This will automatically add the `DATABASE_URL` environment variable to your project

4. **Run Database Migrations:**
   After the database is connected, you need to run migrations. You can do this in two ways:

   **Option A: Via Vercel CLI (Recommended)**
   ```bash
   # Pull the environment variables from Vercel
   vercel env pull .env.local
   
   # Run Prisma migrations
   npx prisma migrate dev --name init
   
   # Push the schema to production
   npx prisma db push
   ```

   **Option B: Add to package.json build script**
   The postinstall script will generate Prisma Client, but you need to push the schema.
   You can add a `vercel-build` script to handle this:
   ```json
   "vercel-build": "prisma db push && next build"
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Troubleshooting

- If you get database connection errors, ensure the `DATABASE_URL` is properly set in Vercel
- Check Vercel logs: `vercel logs`
- Verify Prisma Client is generated: The postinstall script should handle this automatically

## Local Development

For local development with PostgreSQL:

1. Install PostgreSQL locally or use Docker:
   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   ```

2. Update your `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/loyalink?schema=public"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
