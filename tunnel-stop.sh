#!/bin/bash
# Stop all Cloudflare tunnels and restore local config

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TUNNEL_LOG_DIR="$SCRIPT_DIR/.tunnel-logs"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}▸ Killing all cloudflared tunnel processes...${NC}"
pkill -f "cloudflared tunnel --url" 2>/dev/null || true

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

rm -rf "$TUNNEL_LOG_DIR" 2>/dev/null

echo ""
echo -e "${GREEN}✓ All tunnels stopped. Local config restored.${NC}"
echo -e "${YELLOW}  Restart your apps to go back to localhost mode.${NC}"
echo ""
