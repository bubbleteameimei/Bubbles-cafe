#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Safe Website Fix Script${NC}"
echo "================================"

# Function to check if command was successful
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 failed${NC}"
        return 1
    fi
}

# Function to prompt user before continuing
prompt_continue() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted by user${NC}"
        exit 1
    fi
}

# Step 1: Check current status
echo -e "\n${BLUE}Step 1: Checking current status...${NC}"
echo "Node.js version: $(node --version 2>/dev/null || echo 'Not found')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'Not found')"

# Step 2: Create environment file if missing
echo -e "\n${BLUE}Step 2: Environment Configuration${NC}"
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    check_success "Environment file created"
    echo -e "${YELLOW}📝 Please edit .env file with your actual values before running the app${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Step 3: Install missing dependencies (safest approach)
echo -e "\n${BLUE}Step 3: Installing Dependencies${NC}"
prompt_continue "Install missing dependencies? This will take a few minutes."

echo "Installing dependencies with legacy peer deps (safer)..."
npm install --legacy-peer-deps --no-audit
check_success "Dependencies installed"

# Step 4: Install dev dependencies for TypeScript
echo -e "\n${BLUE}Step 4: Installing Development Dependencies${NC}"
echo "Installing TypeScript and development tools..."
npm install -D typescript@latest tsx@latest --legacy-peer-deps
check_success "Development dependencies installed"

# Step 5: Fix security vulnerabilities (safer approach)
echo -e "\n${BLUE}Step 5: Security Fixes${NC}"
prompt_continue "Fix security vulnerabilities? This may update some packages."

echo "Fixing vulnerabilities with safe approach..."
npm audit fix --legacy-peer-deps
check_success "Security vulnerabilities fixed (safe mode)"

# Step 6: Check if TypeScript works
echo -e "\n${BLUE}Step 6: Testing TypeScript${NC}"
if command -v npx &> /dev/null; then
    npx tsc --version >/dev/null 2>&1
    check_success "TypeScript compiler working"
else
    echo -e "${YELLOW}⚠️  npx not available, skipping TypeScript test${NC}"
fi

# Step 7: Test if project can build
echo -e "\n${BLUE}Step 7: Testing Build Process${NC}"
prompt_continue "Test if the project can build? This will help identify remaining issues."

echo "Testing TypeScript compilation..."
npx tsc --noEmit --skipLibCheck || echo -e "${YELLOW}⚠️  TypeScript has errors (may be normal)${NC}"

# Step 8: Summary and next steps
echo -e "\n${GREEN}🎉 Fix Process Complete!${NC}"
echo "================================"
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Edit .env file with your actual database and API credentials"
echo "2. Start the development server: npm run dev"
echo "3. Test core functionality:"
echo "   - User registration/login"
echo "   - Creating and reading posts"
echo "   - Comment system"
echo ""
echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
echo "- Set DATABASE_URL in .env for database functionality"
echo "- Set GMAIL_USER and GMAIL_APP_PASSWORD for email features"
echo "- Set API keys for external services if needed"
echo ""
echo -e "${BLUE}To start your application:${NC}"
echo "npm run dev"