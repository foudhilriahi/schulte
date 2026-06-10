#!/usr/bin/env bash
# =============================================================================
# SCHULTE TUNISIA — API Curl Demo
# Auto-login + curl calls with JSON responses, all in one terminal.
# Usage: bash scripts/api-demo.sh
# No configuration needed.
# =============================================================================

BASE=""
SEP="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "$SEP"
echo "  SCHULTE TUNISIA — API DEMO"
echo "$SEP"

# Auto-detect backend port
for PORT in 4000 5000 3001 8080; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/api/health" 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    BASE="http://localhost:$PORT/api"
    break
  fi
done
if [ -z "$BASE" ]; then
  echo ""
  echo "  Serveur introuvable sur les ports 4000, 5000, 3001, 8080"
  echo "  Lancez le backend: cd backend && npm run dev"
  echo ""
  exit 1
fi
echo "  Serveur: $BASE"
echo "$SEP"

# ─── Phase 1: Login ──────────────────────────────────────────────────────────
echo ""
echo "$SEP"
echo "  PHASE 1 — AUTHENTIFICATION"
echo "$SEP"
echo ""
echo "  curl -X POST $BASE/auth/login"
echo "    -H 'Content-Type: application/json'"
echo "    -d '{\"email\":\"admin@schulte-tunisia.com\",\"password\":\"admin123\"}'"
echo ""

LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schulte-tunisia.com","password":"admin123"}')

LOGIN_BODY=$(echo "$LOGIN_RESP" | sed '$d')
LOGIN_CODE=$(echo "$LOGIN_RESP" | tail -n1)

if [ "$LOGIN_CODE" != "200" ]; then
  echo "  HTTP $LOGIN_CODE"
  echo ""
  echo "$LOGIN_BODY" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_BODY"
  echo ""
  echo "  Erreur de connexion."
  echo "  Verifiez que le backend est lance et seede:"
  echo "  cd backend && npx tsx prisma/seed.ts"
  echo ""
  exit 1
fi

TOKEN=$(echo "$LOGIN_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

echo "  HTTP $LOGIN_CODE"
echo ""
echo "$LOGIN_BODY" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_BODY"
echo ""
echo "  Token: ${TOKEN:0:40}..."
echo ""

AUTH="Authorization: Bearer $TOKEN"

# ─── Helper ──────────────────────────────────────────────────────────────────
call() {
  local METHOD="$1"
  local URL="$2"
  local DATA="${3:-}"
  local TITLE="$4"

  echo "$SEP"
  echo "  $TITLE"
  echo ""
  echo "  curl -X $METHOD $BASE$URL"

  if [ -n "$DATA" ]; then
    echo "    -H 'Content-Type: application/json'"
    local SHORT=$(echo "$DATA" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(json.dumps(d,indent=2,ensure_ascii=False))
" 2>/dev/null || echo "$DATA")
    echo "    -d '$SHORT'"
  fi

  echo ""

  local CMD="curl -s -w \"\n%{http_code}\" -X $METHOD \"$BASE$URL\""
  CMD+=" -H \"$AUTH\""
  CMD+=" -H \"Content-Type: application/json\""
  if [ -n "$DATA" ]; then
    CMD+=" -d '$DATA'"
  fi

  RESP=$(eval "$CMD")
  BODY=$(echo "$RESP" | sed '$d')
  CODE=$(echo "$RESP" | tail -n1)

  echo "  HTTP $CODE"
  echo ""
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  echo ""
}

# ─── Phase 2: Server Health ──────────────────────────────────────────────────
echo "$SEP"
echo "  PHASE 2 — SANTE DU SERVEUR"
echo "$SEP"
echo ""
echo "  curl $BASE/health"
echo ""
HEALTH=$(curl -s -w "\n%{http_code}" "$BASE/health")
H_BODY=$(echo "$HEALTH" | sed '$d')
H_CODE=$(echo "$HEALTH" | tail -n1)
echo "  HTTP $H_CODE"
echo ""
echo "$H_BODY" | python3 -m json.tool 2>/dev/null || echo "$H_BODY"
echo ""

# ─── Phase 3: Notifications Push ─────────────────────────────────────────────
echo "$SEP"
echo "  PHASE 3 — NOTIFICATIONS PUSH"
echo "$SEP"

call "GET"  "/notifications/vapid-public-key" "" \
  "1 — Cle publique VAPID"

call "POST" "/notifications/subscribe" \
  '{"subscription":{"endpoint":"https://demo.push/endpoint","keys":{"p256dh":"p256dhKey","auth":"authKey"}}}' \
  "2 — Souscrire aux notifications push"

call "GET"  "/notifications" "" \
  "3 — Lister les notifications"

call "GET"  "/notifications/unread-count" "" \
  "4 — Nombre de notifications non lues"

call "PATCH" "/notifications/mark-all-read" "" \
  "5 — Tout marquer comme lu"

call "DELETE" "/notifications/clear-all" "" \
  "6 — Tout supprimer"

call "GET"  "/notifications" "" \
  "7 — Verifier que la liste est vide"

# ─── Phase 4: Admin Dashboard ────────────────────────────────────────────────
echo "$SEP"
echo "  PHASE 4 — ADMIN DASHBOARD"
echo "$SEP"

call "GET" "/admin/overview" "" \
  "8 — Vue d'ensemble (KPI, statistiques)"

call "GET" "/admin/hr-accounts" "" \
  "9 — Comptes RH"

call "GET" "/admin/templates" "" \
  "10 — Templates d'offres"

# ─── Phase 5: Verification acces ─────────────────────────────────────────────
echo "$SEP"
echo "  PHASE 5 — VERIFICATION AUTH (sans token => 401)"
echo ""

for EP in "GET /notifications" "GET /notifications/unread-count" "GET /notifications/vapid-public-key"; do
  M="${EP%% *}"
  P="${EP#* }"

  echo "  curl -X $M $BASE$P"
  echo "    (sans header Authorization)"
  echo ""

  C=$(curl -s -o /dev/null -w "%{http_code}" -X "$M" "$BASE$P" -H "Content-Type: application/json")
  echo "  HTTP $C"
  echo ""

  if [ "$C" = "401" ]; then
    echo "  => Acces refuse (attendu)"
  else
    echo "  => Attention: attendu 401, recu $C"
  fi

  echo ""
done

# ─── Done ────────────────────────────────────────────────────────────────────
echo "$SEP"
echo "  DEMO TERMINEE"
echo "$SEP"
echo ""
