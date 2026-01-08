#!/bin/bash

# LOYALINK Production Setup Script
# This script helps set up production credentials and environment

set -e

echo "🔗 LOYALINK Production Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo -e "${YELLOW}📝 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please log in to Vercel:${NC}"
    vercel login
fi

echo ""
echo -e "${GREEN}✅ Vercel CLI is ready${NC}"
echo ""

# Prompt for deployment type
echo "Select deployment type:"
echo "1) New deployment (first time)"
echo "2) Update existing deployment"
read -p "Enter choice (1 or 2): " deploy_choice

if [ "$deploy_choice" = "1" ]; then
    echo ""
    echo -e "${YELLOW}🚀 Setting up new deployment...${NC}"
    echo ""
    
    # Link or create new project
    echo "This will link your local project to Vercel."
    vercel link
    
    echo ""
    echo -e "${GREEN}✅ Project linked${NC}"
    echo ""
    
    # Set up database
    echo -e "${YELLOW}📊 Database Setup${NC}"
    echo "Please complete these steps in Vercel Dashboard:"
    echo "1. Go to your project: https://vercel.com/dashboard"
    echo "2. Navigate to Storage → Create Database → Postgres"
    echo "3. Connect the database to your project"
    echo "4. The DATABASE_URL will be automatically added"
    echo ""
    read -p "Press Enter when database is set up..."
    
    # Pull environment variables
    echo ""
    echo -e "${YELLOW}📥 Pulling environment variables...${NC}"
    vercel env pull .env.production
    
    echo ""
    echo -e "${GREEN}✅ Environment variables pulled${NC}"
    
    # Generate Prisma Client
    echo ""
    echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
    npx prisma generate
    
    # Push database schema
    echo ""
    echo -e "${YELLOW}📤 Pushing database schema...${NC}"
    DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)
    export DATABASE_URL
    npx prisma db push
    
    echo ""
    echo -e "${GREEN}✅ Database schema pushed${NC}"
    
    # Deploy to production
    echo ""
    echo -e "${YELLOW}🚀 Deploying to production...${NC}"
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    
elif [ "$deploy_choice" = "2" ]; then
    echo ""
    echo -e "${YELLOW}🔄 Updating existing deployment...${NC}"
    
    # Pull latest environment variables
    echo ""
    echo -e "${YELLOW}📥 Pulling environment variables...${NC}"
    vercel env pull .env.production
    
    # Generate Prisma Client
    echo ""
    echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
    npx prisma generate
    
    # Check if schema changes exist
    echo ""
    read -p "Do you have database schema changes? (y/n): " schema_changes
    
    if [ "$schema_changes" = "y" ]; then
        echo -e "${YELLOW}📤 Pushing database schema...${NC}"
        DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)
        export DATABASE_URL
        npx prisma db push
        echo -e "${GREEN}✅ Database schema updated${NC}"
    fi
    
    # Deploy to production
    echo ""
    echo -e "${YELLOW}🚀 Deploying to production...${NC}"
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

# Health check
echo ""
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 5  # Wait for deployment to be ready

# Get deployment URL
DEPLOY_URL=$(vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1)

if [ -n "$DEPLOY_URL" ]; then
    echo "Testing: $DEPLOY_URL/api/health"
    if curl -s "$DEPLOY_URL/api/health" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check returned unexpected response${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not determine deployment URL${NC}"
fi

echo ""
echo -e "${GREEN}=============================="
echo "🎉 Setup Complete!"
echo "==============================${NC}"
echo ""
echo "Next steps:"
echo "1. Visit your deployment URL"
echo "2. Test all functionality"
echo "3. Monitor logs: vercel logs"
echo "4. Check the PRODUCTION_CHECKLIST.md"
echo ""
