#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
REPORT_DIR="reports/smoke"
mkdir -p "$REPORT_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="$REPORT_DIR/auth-smoke-$TIMESTAMP.md"

declare -a TESTS=(
  "AUTH-LOGIN-OK|Login valid candidate|Use a known candidate account|Open /login, submit valid credentials|Redirects to / and session is active"
  "AUTH-LOGIN-BAD|Login invalid credentials|No active session|Open /login, submit wrong password|Stays on login with clear error and no crash"
  "AUTH-LOGOUT|Logout clears session|Login first|Go to /profile then click logout|Returns to /login and protected routes are blocked"
  "AUTH-SWITCH-USER|Switch account on same browser|Two candidate accounts available|Login as user A then logout then login as user B|No user A data shown in notifications/applications/profile"
  "AUTH-OFFLINE-AUTH-PAGE|Offline login screen resilience|Browser devtools available|Open /login then enable Offline network|Page still renders and shows graceful API error on submit"
  "AUTH-OFFLINE-AFTER-LOGIN|Offline after authenticated session|Login first and visit offers/applications|Enable Offline, navigate between / and /applications|No blank crash page; cached UI/data behavior is graceful"
  "AUTH-FORGOT-PASSWORD|Forgot password flow|Known email address|Open /forgot-password and submit email|Shows success state and no runtime errors"
  "AUTH-RESET-PASSWORD-TOKEN|Reset password token validation|No token URL and one valid token URL|Open /reset-password then /reset-password?token=<valid>|Invalid token view works; valid token reset succeeds"
)

pass_count=0
fail_count=0
skip_count=0

cat > "$REPORT_FILE" <<EOF
# Auth Smoke Test Report

- Date: $(date -Iseconds)
- Base URL: $BASE_URL
- Tester: ${USER:-unknown}

| ID | Scenario | Result | Notes |
|---|---|---|---|
EOF

echo "Auth smoke checklist"
echo "Base URL: $BASE_URL"
echo "Report: $REPORT_FILE"
echo
echo "Run each scenario manually, then enter result:"
echo "  p = PASS, f = FAIL, s = SKIP"
echo

for test in "${TESTS[@]}"; do
  IFS='|' read -r id scenario preconditions steps expected <<< "$test"

  echo "[$id] $scenario"
  echo "Preconditions: $preconditions"
  echo "Steps: $steps"
  echo "Expected: $expected"

  result=""
  while [[ -z "$result" ]]; do
    read -r -p "Result (p/f/s): " answer
    case "${answer,,}" in
      p) result="PASS"; ((pass_count+=1)) ;;
      f) result="FAIL"; ((fail_count+=1)) ;;
      s) result="SKIP"; ((skip_count+=1)) ;;
      *) echo "Please enter p, f, or s." ;;
    esac
  done

  read -r -p "Notes (optional): " notes
  notes="${notes//|/\\|}"
  echo "| $id | $scenario | $result | $notes |" >> "$REPORT_FILE"
  echo
done

{
  echo
  echo "## Summary"
  echo
  echo "- PASS: $pass_count"
  echo "- FAIL: $fail_count"
  echo "- SKIP: $skip_count"
} >> "$REPORT_FILE"

echo "Smoke test report saved to $REPORT_FILE"
echo "PASS: $pass_count, FAIL: $fail_count, SKIP: $skip_count"

if (( fail_count > 0 )); then
  exit 1
fi
