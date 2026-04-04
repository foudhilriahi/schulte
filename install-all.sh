#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing dependencies for all projects...${NC}\n"

# Backend
echo -e "${BLUE}📦 Installing Backend dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend installed${NC}\n"
else
    echo -e "${RED}✗ Backend installation failed${NC}\n"
    exit 1
fi
cd ..

# Candidate PWA
echo -e "${BLUE}📦 Installing Candidate PWA dependencies...${NC}"
cd candidate
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Candidate PWA installed${NC}\n"
else
    echo -e "${RED}✗ Candidate PWA installation failed${NC}\n"
    exit 1
fi
cd ..

# HR Dashboard
echo -e "${BLUE}📦 Installing HR Dashboard dependencies...${NC}"
cd hr
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ HR Dashboard installed${NC}\n"
else
    echo -e "${RED}✗ HR Dashboard installation failed${NC}\n"
    exit 1
fi
cd ..

echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Set up your .env file in ./backend/"
echo "2. Run: npx prisma migrate dev --name init"
echo "3. Run: npx prisma db seed"
echo "4. Then run: ./start-all.sh"
