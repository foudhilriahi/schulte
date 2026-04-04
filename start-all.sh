#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting all 3 servers...${NC}\n"

# Function to start a service
start_service() {
    local name=$1
    local folder=$2
    local port=$3
    
    echo -e "${BLUE}Starting $name on port $port...${NC}"
    cd "$folder"
    npm run dev &
    SERVICE_PID=$!
    cd ..
    echo -e "${GREEN}✓ $name started (PID: $SERVICE_PID)${NC}"
}

# Start Backend (port 4000)
start_service "Backend" "backend" "4000"
BACKEND_PID=$!

# Small delay to ensure backend starts
sleep 2

# Start HR Dashboard (port 8080)
start_service "HR Dashboard" "hr" "8080"
HR_PID=$!

# Start Candidate PWA (port 3000)
start_service "Candidate PWA" "candidate" "3000"
CANDIDATE_PID=$!

echo -e "\n${GREEN}✅ All servers started!${NC}\n"
echo -e "${YELLOW}📍 Access points:${NC}"
echo "   HR Dashboard:     http://localhost:8080"
echo "   Candidate PWA:    http://localhost:3000"
echo "   Backend API:      http://localhost:4000"
echo -e "\n${YELLOW}💡 To stop all servers, run: killall node${NC}\n"

# Keep the script running
wait
