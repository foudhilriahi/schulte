# P0/P1 Execution Tasks Checklist

## Conventions
- Status: `todo`, `in_progress`, `done`.
- Priority: P0 then P1.
- Dependency format: task IDs that must complete first.
- Acceptance criteria must be met before marking `done`.

## Phase 0 (Preflight)

### T-BASE-01
- Status: `done`
- Scope: Run baseline builds in `backend`, `candidate`, `hr`.
- Dependency: none
- Acceptance criteria:
  - `npm run build` executed in all three apps.
  - Results captured in execution notes for before/after comparison.

### T-BASE-02
- Status: `done`
- Scope: Snapshot current endpoint behavior for affected routes (authz, pagination candidates, interview/admin payloads).
- Dependency: `T-BASE-01`
- Acceptance criteria:
  - Baseline behavior documented for later regression checks.

## Phase 1 (P0 Security/Data Integrity)

### T-P0-01 (`B-01`)
- Status: `done`
- Scope: Remove hardcoded seed admin password; require env-driven seed secret; fail fast if missing in non-dev.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - No literal default admin password remains in seed code.
  - Seed reads password from env variable.
  - In non-dev mode, missing env value aborts with clear error.

### T-P0-02 (`B-02`)
- Status: `done`
- Scope: Add ownership/site authorization for `GET /api/applications/:id`.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Candidate can only read own application.
  - HR cannot read applications outside own site.
  - Unauthorized access returns `403`.

### T-P0-03 (`B-03`)
- Status: `done`
- Scope: Enforce offer site ownership before HR update/delete.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - HR update/delete blocked for offers outside HR site.
  - Admin retains authorized management access.
  - Unauthorized mutations return `403`.

### T-P0-04 (`B-04`)
- Status: `done`
- Scope: Enforce interview schedule/outcome site ownership; block cross-site HR actions.
- Dependency: `T-P0-02`, `T-P0-03`
- Acceptance criteria:
  - HR can schedule/mark outcome only for applications in own site.
  - Cross-site attempts return `403`.
  - Existing role checks remain intact.

### T-P0-05 (`B-05`)
- Status: `done`
- Scope: Sanitize interview/admin candidate payload; never expose `passwordHash`.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Interview and related admin payloads exclude sensitive fields (`passwordHash` minimum).
  - Response shape remains functionally compatible for frontend consumers.

### T-P0-06 (`B-14`)
- Status: `done`
- Scope: Validate `bulkUpdateStatus`, cap `ids` length, and use transaction semantics.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Invalid status rejected with `400`.
  - Request with oversized `ids` rejected with clear validation message.
  - Batch update applies atomically (all-or-nothing).

### T-P0-07 (`B-15`)
- Status: `done`
- Scope: Prevent scheduleInterview from overwriting terminal application statuses.
- Dependency: `T-P0-04`
- Acceptance criteria:
  - Applications in `accepted`/`rejected` status are not moved back to `interview`.
  - API returns clear business-rule error on blocked schedule attempt.

### T-P0-08 (`B-06`)
- Status: `done`
- Scope: Protect candidate self-delete when linked active applications exist.
- Dependency: `T-P0-02`
- Acceptance criteria:
  - Delete profile blocked when active/in-process applications exist.
  - Error message explains required action before account deletion.

### T-P0-09 (`B-07`)
- Status: `done`
- Scope: Prevent CV deletion when referenced by active applications.
- Dependency: `T-P0-02`
- Acceptance criteria:
  - CV delete blocked if linked to active application(s).
  - Safe delete still allowed when only terminal/no linked applications.

## Phase 2 (P1 Stability/Performance)

### T-P1-01 (`B-08`)
- Status: `done`
- Scope: Guard `JSON.parse` in HR auth store.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Corrupt stored JSON no longer crashes app startup.
  - Invalid session data is cleared and app recovers to logged-out state.

### T-P1-02 (`B-09`)
- Status: `done`
- Scope: Add safe JSON parsing/fallback in dual AI analysis flow.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Malformed provider payload does not crash the flow.
  - User receives controlled fallback/error outcome.

### T-P1-03 (`B-11`)
- Status: `done`
- Scope: Add refresh-token mutex/queue in candidate axios interceptor.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Concurrent `401` responses trigger only one refresh request.
  - Queued requests retry correctly after refresh success.
  - Refresh failure still triggers logout path once.

### T-P1-04 (`B-12`)
- Status: `done`
- Scope: Align candidate `Application` type with `appliedAt`; remove invalid date rendering.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - `Application` interface includes `appliedAt` (compat kept for current consumers).
  - Application card/date paths render valid fallback-safe dates.

### T-P1-05 (`B-13`)
- Status: `done`
- Scope: Add pagination to heavy endpoints with backward-compatible defaults.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Optional params (`limit`, `cursor` where used) supported.
  - No pagination params => behavior compatible with existing clients.
  - Payload size is bounded when params are provided.

### T-P1-06 (`B-16`)
- Status: `done`
- Scope: Tighten CORS with explicit allowlist and controlled localhost behavior.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - Allowed origins are explicit and environment-driven.
  - Localhost policy is restricted to intended dev usage.
  - Unauthorized origins are rejected by CORS policy.

### T-P1-07 (`B-18`)
- Status: `done`
- Scope: Add optimistic rollback + user feedback for candidate notification mutations.
- Dependency: `T-BASE-02`
- Acceptance criteria:
  - On mutation failure, state reverts correctly.
  - User receives visible failure feedback.
  - Silent-failure paths are removed for targeted mutations.

## Phase 3 (Verification and Exit Criteria)

### T-VERIFY-01
- Status: `done`
- Scope: Backend authz, transaction, and seed env behavior verification.
- Dependency: `T-P0-01`, `T-P0-02`, `T-P0-03`, `T-P0-04`, `T-P0-05`, `T-P0-06`, `T-P0-07`, `T-P0-08`, `T-P0-09`
- Acceptance criteria:
  - Cross-site/cross-owner tests enforce `403` as expected.
  - Bulk status update behavior is atomic.
  - Seed behavior validated with and without required env var.

### T-VERIFY-02
- Status: `done`
- Scope: Frontend resilience verification (HR parse safety, candidate refresh mutex, date rendering, notification rollback).
- Dependency: `T-P1-01`, `T-P1-02`, `T-P1-03`, `T-P1-04`, `T-P1-07`
- Acceptance criteria:
  - All target regression scenarios pass without crash/data corruption.

### T-VERIFY-03
- Status: `done`
- Scope: Full build and data-leak gate checks.
- Dependency: `T-VERIFY-01`, `T-VERIFY-02`, `T-P1-05`, `T-P1-06`
- Acceptance criteria:
  - `npm run build` succeeds in `backend`, `candidate`, and `hr`.
  - Interview/admin responses contain no `passwordHash`.
  - Paginated endpoints remain compatible when params are absent.
