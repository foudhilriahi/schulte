#!/usr/bin/env bash
# =============================================================================
# SCHULTE TUNISIA — Unified Test Runner + API Curl Demo
# Runs ALL unit tests, builds, AND live API curl calls in one terminal.
# Usage: bash scripts/run-all-tests.sh
# For API calls: export TEST_TOKEN="eyJ..." first (or script skips curls)
# Ideal for: video recording / GIF capture for presentation
# =============================================================================

set -eo pipefail

SEP="══════════════════════════════════════════════════════════════"
PASS=0
FAIL=0
RESULTS=""

run_test() {
  local NAME="$1"
  local DIR="$2"
  local CMD="$3"

  echo ""
  echo "$SEP"
  echo "  $NAME"
  echo "$SEP"
  echo ""

  set +e
  OUTPUT=$(cd "$DIR" && eval "$CMD" 2>&1)
  EXIT_CODE=$?
  set -e

  if [ $EXIT_CODE -eq 0 ]; then
    PASS=$((PASS + 1))
    RESULTS="${RESULTS}  PASS  $NAME"$'\n'
  else
    FAIL=$((FAIL + 1))
    RESULTS="${RESULTS}  FAIL  $NAME"$'\n'
  fi

  echo "$OUTPUT"
  echo ""
  echo "Exit code: $EXIT_CODE"
  echo ""
}

# ============================================================================
#  HEADER
# ============================================================================
echo ""
echo "$SEP"
echo "  SCHULTE TUNISIA — FULL TEST SUITE + API DEMO"
echo "  Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "$SEP"
echo ""
echo "  Backend : $BASE"
echo   "  Token   : ${TEST_TOKEN:-}(empty = curls skipped)"
echo ""

# ============================================================================
#  PHASE 1 — UNIT TESTS
# ============================================================================
echo ""
echo "$SEP"
echo "  PHASE 1 — UNIT TESTS"
echo "$SEP"

run_test "Backend Unit Tests (vitest)" \
  "/home/dell/pfe/schulte/backend" \
  "npm test 2>&1"

run_test "HR Dashboard Unit Tests (vitest)" \
  "/home/dell/pfe/schulte/hr" \
  "npm test 2>&1"

# ============================================================================
#  PHASE 2 — BUILDS
# ============================================================================
echo ""
echo "$SEP"
echo "  PHASE 2 — BUILD VERIFICATION"
echo "$SEP"

run_test "Backend TypeScript Compilation (tsc --noEmit)" \
  "/home/dell/pfe/schulte/backend" \
  "npx tsc --noEmit 2>&1"

run_test "HR Dashboard Build (vite)" \
  "/home/dell/pfe/schulte/hr" \
  "npm run build 2>&1 | tail -10"

run_test "Candidate PWA Build (next)" \
  "/home/dell/pfe/schulte/candidate" \
  "npm run build 2>&1 | tail -20"

# ============================================================================
#  PHASE 3 — API CURL DEMO (only if token provided)
# ============================================================================
if [ -z "${TEST_TOKEN:-}" ]; then
  echo ""
  echo "$SEP"
  echo "  PHASE 3 — API CURL DEMO (SKIPPED — no TEST_TOKEN)"
  echo "$SEP"
  echo ""
  echo "  Set TEST_TOKEN to run live API demo:"
  echo "    export TEST_TOKEN=\"eyJ...\""
  echo "    bash scripts/run-all-tests.sh"
  echo ""
else
  run_test "API Curl Demo (scripts/api-demo.sh)" \
    "/home/dell/pfe/schulte" \
    "bash scripts/api-demo.sh 2>&1"
fi

# ============================================================================
#  SUMMARY
# ============================================================================
echo ""
echo "$SEP"
echo "  FINAL SUMMARY"
echo "$SEP"
echo ""
echo "  Total Passed: $PASS"
echo "  Total Failed: $FAIL"
echo ""
echo "$RESULTS"
echo "$SEP"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
