#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  SCHULTE TUNISIA — Share with Professor via Cloudflare Tunnels
# ═══════════════════════════════════════════════════════════════
#
#  BEFORE running this script:
#    1. Start backend in a terminal:    cd backend && npm run dev
#    2. Start candidate in a terminal:  cd candidate && npm run dev
#    3. Start hr in a terminal:         cd hr && npm run dev
#
#  Then run:  bash tunnel-share.sh
#
#  This creates 3 Cloudflare Quick Tunnels (no account needed)
#  and updates your .env files so the apps talk to each other
#  through the public tunnel URLs.
# ═══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TUNNEL_LOG_DIR="$SCRIPT_DIR/.tunnel-logs"
mkdir -p "$TUNNEL_LOG_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  SCHULTE TUNISIA — Cloudflare Tunnel Sharing${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# ── Check that cloudflared is installed ──
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}✗ cloudflared not found. Install it first:${NC}"
    echo "  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared"
    echo "  chmod +x /usr/local/bin/cloudflared"
    exit 1
fi

# ── Check that services are running ──
echo -e "${YELLOW}▸ Checking local services...${NC}"

check_port() {
    local port=$1
    local name=$2
    if curl -s --max-time 2 "http://localhost:$port" > /dev/null 2>&1 || \
       curl -s --max-time 2 "http://localhost:$port/api/health" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $name is running on port $port"
        return 0
    else
        echo -e "  ${RED}✗${NC} $name is NOT running on port $port"
        return 1
    fi
}

ALL_RUNNING=true
check_port 4000 "Backend API"    || ALL_RUNNING=false
check_port 3000 "Candidate PWA"  || ALL_RUNNING=false
check_port 8080 "HR/Admin SPA"   || ALL_RUNNING=false

if [ "$ALL_RUNNING" = false ]; then
    echo ""
    echo -e "${RED}✗ Some services are not running. Start them first:${NC}"
    echo -e "  Terminal 1: ${CYAN}cd $SCRIPT_DIR/backend && npm run dev${NC}"
    echo -e "  Terminal 2: ${CYAN}cd $SCRIPT_DIR/candidate && npm run dev${NC}"
    echo -e "  Terminal 3: ${CYAN}cd $SCRIPT_DIR/hr && npm run dev${NC}"
    echo ""
    echo -e "${YELLOW}Then re-run: bash tunnel-share.sh${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All 3 services running!${NC}"
echo ""

# ── Kill any previous tunnel processes ──
pkill -f "cloudflared tunnel --url" 2>/dev/null || true
sleep 1

# ── Function to extract tunnel URL from cloudflared logs ──
get_tunnel_url() {
    local logfile=$1
    local timeout=30
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        # cloudflared prints the URL in its logs
        local url=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$logfile" 2>/dev/null | head -1)
        if [ -n "$url" ]; then
            echo "$url"
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    echo ""
    return 1
}

# ── Start 3 tunnels ──
echo -e "${YELLOW}▸ Starting Cloudflare tunnels (this takes ~15 seconds)...${NC}"
echo ""

# Tunnel 1: Backend API (port 4000)
echo -e "  ${CYAN}[1/3]${NC} Creating tunnel for Backend API (port 4000)..."
cloudflared tunnel --url http://localhost:4000 > "$TUNNEL_LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Tunnel 2: Candidate PWA (port 3000)
echo -e "  ${CYAN}[2/3]${NC} Creating tunnel for Candidate PWA (port 3000)..."
cloudflared tunnel --url http://localhost:3000 > "$TUNNEL_LOG_DIR/candidate.log" 2>&1 &
CANDIDATE_PID=$!

# Tunnel 3: HR/Admin (port 8080)
echo -e "  ${CYAN}[3/3]${NC} Creating tunnel for HR/Admin SPA (port 8080)..."
cloudflared tunnel --url http://localhost:8080 > "$TUNNEL_LOG_DIR/hr.log" 2>&1 &
HR_PID=$!

echo ""
echo -e "${YELLOW}▸ Waiting for tunnel URLs...${NC}"

BACKEND_URL=$(get_tunnel_url "$TUNNEL_LOG_DIR/backend.log")
CANDIDATE_URL=$(get_tunnel_url "$TUNNEL_LOG_DIR/candidate.log")
HR_URL=$(get_tunnel_url "$TUNNEL_LOG_DIR/hr.log")

if [ -z "$BACKEND_URL" ] || [ -z "$CANDIDATE_URL" ] || [ -z "$HR_URL" ]; then
    echo -e "${RED}✗ Failed to get tunnel URLs. Check logs in $TUNNEL_LOG_DIR/${NC}"
    [ -z "$BACKEND_URL" ]   && echo -e "  ${RED}Backend tunnel failed${NC}"
    [ -z "$CANDIDATE_URL" ] && echo -e "  ${RED}Candidate tunnel failed${NC}"
    [ -z "$HR_URL" ]        && echo -e "  ${RED}HR tunnel failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All tunnels active!${NC}"
echo ""

# ── Update backend .env with tunnel URLs for CORS ──
echo -e "${YELLOW}▸ Updating backend CORS (.env)...${NC}"

# Backup original .env
if [ -f "$SCRIPT_DIR/backend/.env" ]; then
  cp "$SCRIPT_DIR/backend/.env" "$SCRIPT_DIR/backend/.env.local-backup"
fi

# Update the URLs in backend .env (no quotes — dotenv includes them literally)
if [ -f "$SCRIPT_DIR/backend/.env" ]; then
  sed "s|^CLIENT_URL=.*|CLIENT_URL=$CANDIDATE_URL|" "$SCRIPT_DIR/backend/.env" > "$SCRIPT_DIR/backend/.env.tmp" && mv "$SCRIPT_DIR/backend/.env.tmp" "$SCRIPT_DIR/backend/.env"
  sed "s|^CANDIDATE_URL=.*|CANDIDATE_URL=$CANDIDATE_URL|" "$SCRIPT_DIR/backend/.env" > "$SCRIPT_DIR/backend/.env.tmp" && mv "$SCRIPT_DIR/backend/.env.tmp" "$SCRIPT_DIR/backend/.env"
  sed "s|^ADMIN_URL=.*|ADMIN_URL=$HR_URL|" "$SCRIPT_DIR/backend/.env" > "$SCRIPT_DIR/backend/.env.tmp" && mv "$SCRIPT_DIR/backend/.env.tmp" "$SCRIPT_DIR/backend/.env"
  sed "s|^HR_URL=.*|HR_URL=$HR_URL|" "$SCRIPT_DIR/backend/.env" > "$SCRIPT_DIR/backend/.env.tmp" && mv "$SCRIPT_DIR/backend/.env.tmp" "$SCRIPT_DIR/backend/.env"
fi

echo -e "  ${GREEN}✓${NC} backend/.env updated (backup → .env.local-backup)"

# ── Create/Update candidate .env.local ──
echo -e "${YELLOW}▸ Updating Candidate PWA env...${NC}"

# Backup if exists
[ -f "$SCRIPT_DIR/candidate/.env.local" ] && cp "$SCRIPT_DIR/candidate/.env.local" "$SCRIPT_DIR/candidate/.env.local.backup"

cat > "$SCRIPT_DIR/candidate/.env.local" << EOF
# Auto-generated by tunnel-share.sh — $(date)
NEXT_PUBLIC_API_URL=${BACKEND_URL}/api
NEXT_PUBLIC_SOCKET_URL=${BACKEND_URL}
EOF

echo -e "  ${GREEN}✓${NC} candidate/.env.local created"

# ── Create/Update HR .env.local ──
echo -e "${YELLOW}▸ Updating HR/Admin env...${NC}"

[ -f "$SCRIPT_DIR/hr/.env.local" ] && cp "$SCRIPT_DIR/hr/.env.local" "$SCRIPT_DIR/hr/.env.local.backup"

cat > "$SCRIPT_DIR/hr/.env.local" << EOF
# Auto-generated by tunnel-share.sh — $(date)
VITE_API_URL=${BACKEND_URL}/api
EOF

echo -e "  ${GREEN}✓${NC} hr/.env.local created"

echo ""
echo -e "${RED}${BOLD}⚠  IMPORTANT: You must restart all 3 apps now for the new env vars to take effect!${NC}"
echo ""
echo -e "  ${CYAN}Terminal 1:${NC} Stop backend (Ctrl+C), then: ${BOLD}cd backend && npm run dev${NC}"
echo -e "  ${CYAN}Terminal 2:${NC} Stop candidate (Ctrl+C), then: ${BOLD}cd candidate && npm run dev${NC}"  
echo -e "  ${CYAN}Terminal 3:${NC} Stop hr (Ctrl+C), then: ${BOLD}cd hr && npm run dev${NC}"
echo ""

# ── Print the summary ──
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  📎 SHARE THESE LINKS WITH YOUR PROFESSOR${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}${BOLD}Candidate App (PWA):${NC}"
echo -e "  ${CYAN}$CANDIDATE_URL${NC}"
echo ""
echo -e "  ${GREEN}${BOLD}HR/Admin Dashboard:${NC}"
echo -e "  ${CYAN}$HR_URL${NC}"
echo ""
echo -e "  ${GREEN}${BOLD}Backend API Health:${NC}"
echo -e "  ${CYAN}$BACKEND_URL/api/health${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "  ${YELLOW}Login credentials:${NC}"
echo -e "  (Connectez-vous avec un compte administrateur valide)"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Tunnels are running in background. PIDs:${NC}"
echo -e "  Backend:   $BACKEND_PID"
echo -e "  Candidate: $CANDIDATE_PID"
echo -e "  HR/Admin:  $HR_PID"
echo ""
echo -e "${YELLOW}To stop everything and restore local config:${NC}"
echo -e "  ${BOLD}bash tunnel-stop.sh${NC}"
echo ""

# ── Save PIDs for cleanup ──
cat > "$TUNNEL_LOG_DIR/pids.txt" << EOF
BACKEND_PID=$BACKEND_PID
CANDIDATE_PID=$CANDIDATE_PID
HR_PID=$HR_PID
EOF

# ── Wait for user to stop ──
echo -e "${GREEN}Press Ctrl+C to stop all tunnels...${NC}"
echo ""

cleanup() {
    echo ""
    echo -e "${YELLOW}▸ Stopping tunnels...${NC}"
    kill $BACKEND_PID $CANDIDATE_PID $HR_PID 2>/dev/null || true
    
    echo -e "${YELLOW}▸ Restoring local .env files...${NC}"
    if [ -f "$SCRIPT_DIR/backend/.env.local-backup" ]; then
        cp "$SCRIPT_DIR/backend/.env.local-backup" "$SCRIPT_DIR/backend/.env"
        rm "$SCRIPT_DIR/backend/.env.local-backup"
        echo -e "  ${GREEN}✓${NC} backend/.env restored"
    fi
    
    [ -f "$SCRIPT_DIR/candidate/.env.local" ] && rm "$SCRIPT_DIR/candidate/.env.local"
    echo -e "  ${GREEN}✓${NC} candidate/.env.local removed"
    
    [ -f "$SCRIPT_DIR/hr/.env.local" ] && rm "$SCRIPT_DIR/hr/.env.local"
    echo -e "  ${GREEN}✓${NC} hr/.env.local removed"
    
    echo ""
    echo -e "${GREEN}✓ All tunnels stopped and local config restored.${NC}"
    echo -e "${YELLOW}  Restart your apps to go back to local mode.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script alive
wait
