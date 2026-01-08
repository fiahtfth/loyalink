#!/bin/bash

# LOYALINK Local Development Setup Script
# This script helps set up the local development environment

set -e

echo "🔗 LOYALINK Local Development Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) found${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Set up environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update DATABASE_URL in .env file${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo ""

# Check database configuration
echo -e "${YELLOW}🗄️  Database Setup${NC}"
echo "Choose your database:"
echo "1) SQLite (easiest for local development)"
echo "2) PostgreSQL (recommended for production-like environment)"
read -p "Enter choice (1 or 2): " db_choice

if [ "$db_choice" = "1" ]; then
    echo ""
    echo -e "${YELLOW}Setting up SQLite...${NC}"
    
    # Update .env with SQLite
    if grep -q "DATABASE_URL=" .env; then
        sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env
        rm .env.bak 2>/dev/null || true
    else
        echo 'DATABASE_URL="file:./dev.db"' >> .env
    fi
    
    echo -e "${GREEN}✅ SQLite configured${NC}"
    
elif [ "$db_choice" = "2" ]; then
    echo ""
    echo -e "${YELLOW}Setting up PostgreSQL...${NC}"
    echo ""
    echo "Make sure PostgreSQL is running."
    echo "You can use Docker:"
    echo "  docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    echo ""
    read -p "Enter PostgreSQL connection string (or press Enter for default): " pg_url
    
    if [ -z "$pg_url" ]; then
        pg_url="postgresql://postgres:password@localhost:5432/loyalink?schema=public"
    fi
    
    # Update .env with PostgreSQL
    if grep -q "DATABASE_URL=" .env; then
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$pg_url\"|" .env
        rm .env.bak 2>/dev/null || true
    else
        echo "DATABASE_URL=\"$pg_url\"" >> .env
    fi
    
    echo -e "${GREEN}✅ PostgreSQL configured${NC}"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

echo ""

# Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Push database schema
echo -e "${YELLOW}📤 Pushing database schema...${NC}"
npx prisma db push

echo -e "${GREEN}✅ Database schema pushed${NC}"
echo ""

# Optional: Open Prisma Studio
read -p "Would you like to open Prisma Studio to view the database? (y/n): " open_studio

if [ "$open_studio" = "y" ]; then
    echo -e "${YELLOW}🎨 Opening Prisma Studio...${NC}"
    echo "Prisma Studio will open in your browser at http://localhost:5555"
    echo "Press Ctrl+C to close it when done."
    npx prisma studio &
    STUDIO_PID=$!
    sleep 3
fi

echo ""
echo -e "${GREEN}=============================="
echo "🎉 Setup Complete!"
echo "==============================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo "3. Useful commands:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npx prisma studio    - Open database GUI"
echo "   npx prisma db push   - Update database schema"
echo ""
echo "For production deployment, run:"
echo "   ./scripts/setup-production.sh"
echo ""

if [ "$open_studio" = "y" ]; then
    echo "Prisma Studio is running in the background (PID: $STUDIO_PID)"
    echo "To stop it: kill $STUDIO_PID"
    echo ""
fi
