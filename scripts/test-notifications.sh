#!/usr/bin/env bash
# =============================================================================
# Notification System — Curl Integration Tests
# =============================================================================
# Prerequisites:
#   - Backend must be running (npm run dev in backend/)
#   - A candidate user must exist
#   - Update TOKEN + CANDIDATE_ID below with real values
# =============================================================================

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000/api}"
TOKEN="${TEST_TOKEN:-}"
CANDIDATE_ID="${CANDIDATE_ID:-}"

if [ -z "$TOKEN" ]; then
  echo "❌ TEST_TOKEN env var required"
  echo "   Get one: curl -s -X POST $BASE_URL/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"candidate@test.com\",\"password\":\"...\"}' | jq -r '.accessToken'"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"
PASS=0
FAIL=0

pass()  { PASS=$((PASS+1)); echo "  ✅ $1"; }
fail()  { FAIL=$((FAIL+1)); echo "  ❌ $1"; }

# ---- 1. Get VAPID Public Key ------------------------------------------------
echo ""
echo "━━━ 1. GET /notifications/vapid-public-key ━━━"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/notifications/vapid-public-key" -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"publicKey"'; then
  pass "VAPID public key returned"
  echo "     Key: $(echo "$BODY" | grep -o '"publicKey":"[^"]*"' | cut -d'"' -f4)"
else
  fail "VAPID public key (HTTP $HTTP_CODE)"
  echo "     $BODY"
fi

# ---- 2. Get Notifications (empty) -------------------------------------------
echo ""
echo "━━━ 2. GET /notifications ━━━"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/notifications" -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  pass "GET /notifications returns array ($(echo "$BODY" | grep -o '"id"' | wc -l) items)"
else
  fail "GET /notifications (HTTP $HTTP_CODE)"
  echo "     $BODY"
fi

# ---- 3. Get Unread Count ----------------------------------------------------
echo ""
echo "━━━ 3. GET /notifications/unread-count ━━━"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/notifications/unread-count" -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"count"'; then
  COUNT=$(echo "$BODY" | grep -o '"count":[0-9]*' | cut -d: -f2)
  pass "Unread count: $COUNT"
else
  fail "GET /notifications/unread-count (HTTP $HTTP_CODE)"
  echo "     $BODY"
fi

# ---- 4. Subscribe to Push ---------------------------------------------------
echo ""
echo "━━━ 4. POST /notifications/subscribe ━━━"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notifications/subscribe" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://mock-push.test/demo-endpoint",
      "keys": {
        "p256dh": "BKFtUxJf8QkzLxPvbEXAMPLEp256dhKey",
        "auth": "demoAuthKey123"
      }
    }
  }')
BODY=$(echo "$RESP" | head -n -1)
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  pass "Push subscription registered"
else
  fail "POST /notifications/subscribe (HTTP $HTTP_CODE)"
  echo "     $BODY"
fi

# ---- 5. Duplicate Subscribe (idempotent upsert) ----------------------------
echo ""
echo "━━━ 5. POST /notifications/subscribe (duplicate) ━━━"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notifications/subscribe" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://mock-push.test/demo-endpoint",
      "keys": {
        "p256dh": "BKFtUxJf8QkzLxPvbEXAMPLEp256dhKey",
        "auth": "demoAuthKey123"
      }
    }
  }')
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  pass "Duplicate subscription handled (upsert)"
else
  fail "Duplicate subscription (HTTP $HTTP_CODE)"
fi

# ---- 6. Subscribe with invalid body (400) ----------------------------------
echo ""
echo "━━━ 6. POST /notifications/subscribe (invalid) ━━━"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notifications/subscribe" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"subscription": {"endpoint": "https://test.com"}}')
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  pass "Invalid subscription returns 400"
else
  fail "Invalid subscription (HTTP $HTTP_CODE)"
fi

# ---- 7. Mark All Read (idempotent - no unread should be fine) ---------------
echo ""
echo "━━━ 7. PATCH /notifications/mark-all-read ━━━"
RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/notifications/mark-all-read" -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  pass "Mark all read (count: $(echo "$BODY" | grep -o '"count":[0-9]*' | cut -d: -f2))"
else
  fail "PATCH /notifications/mark-all-read (HTTP $HTTP_CODE)"
fi

# ---- 8. Clear All -----------------------------------------------------------
echo ""
echo "━━━ 8. DELETE /notifications/clear-all ━━━"
RESP=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/notifications/clear-all" -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
HTTP_CODE=$(echo "$RESP" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  pass "Clear all (count: $(echo "$BODY" | grep -o '"count":[0-9]*' | cut -d: -f2))"
else
  fail "DELETE /notifications/clear-all (HTTP $HTTP_CODE)"
fi

# ---- 9. Get Notifications (verify empty after clear) ------------------------
echo ""
echo "━━━ 9. GET /notifications (verify empty) ━━━"
RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/notifications" -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
HTTP_CODE=$(echo "$RESP" | tail -n1)
ITEM_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
if [ "$HTTP_CODE" = "200" ] && [ "$ITEM_COUNT" -eq 0 ]; then
  pass "Notifications empty after clear"
else
  fail "Notifications not empty ($ITEM_COUNT items)"
fi

# ---- 10. Auth required (no token = 401) -------------------------------------
echo ""
echo "━━━ 10. Auth guard ━━━"
ENDPOINTS=(
  "GET /notifications"
  "GET /notifications/unread-count"
  "GET /notifications/vapid-public-key"
  "POST /notifications/subscribe"
  "PATCH /notifications/mark-all-read"
  "DELETE /notifications/clear-all"
)
for EP in "${ENDPOINTS[@]}"; do
  METHOD="${EP%% *}"
  PATH="${EP#* }"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "$BASE_URL$PATH" -H "Content-Type: application/json")
  if [ "$HTTP_CODE" = "401" ]; then
    pass "$EP → 401 (auth required)"
  else
    fail "$EP → $HTTP_CODE (expected 401)"
  fi
done

# ---- Summary ----------------------------------------------------------------
echo ""
echo "══════════════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed"
echo "══════════════════════════════════════════════"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
