# Safe P0/P1 Anomaly Remediation Plan

## Summary
- Goal: deliver a safe first remediation pass for confirmed P0/P1 anomalies with backward-compatible APIs by default.
- Scope lock: P0 + P1 only.
- API compatibility: preserve response contracts unless stricter auth/security behavior is required.
- Notes on partially outdated anomaly statements:
  - `B-04`: role-level protection for interview outcome exists; missing control is site/ownership scoping.
  - `B-07`: DB relation uses `onDelete: SetNull`; business guard is still required to block deletion of CVs linked to active applications.
  - `B-28`: permanent HR delete flow currently reassigns owned entities in a transaction.

## Verified P0/P1 Anomaly Matrix
| ID | Status (Confirmed/Partial/Deferred) | Fix Safety | Owner | Dependency |
|---|---|---|---|---|
| B-01 | Confirmed | High | Backend | Env/config update for seed secret |
| B-02 | Confirmed | High | Backend | Application/Offer lookup for scope check |
| B-03 | Confirmed | High | Backend | Offer ownership/site validation path |
| B-04 | Partial | High | Backend | Interview + application site ownership checks |
| B-05 | Confirmed | High | Backend | Response projection/select sanitation |
| B-06 | Confirmed | Medium | Backend | Candidate deletion pre-check for active apps |
| B-07 | Partial | High | Backend | CV usage check before delete |
| B-14 | Confirmed | Medium | Backend | Status normalization + batch cap + transaction |
| B-15 | Confirmed | High | Backend | Terminal status guard before scheduling |
| B-08 | Confirmed | High | HR Frontend | Safe JSON parse and storage cleanup fallback |
| B-09 | Confirmed | High | HR Frontend | Safe parse fallback for provider JSON |
| B-11 | Confirmed | Medium | Candidate Frontend | Shared refresh mutex/promise queue |
| B-12 | Confirmed | High | Candidate Frontend | Type/interface alignment with backend field |
| B-13 | Confirmed | Medium | Backend | Pagination params + defaults |
| B-16 | Confirmed | Medium | Backend | Origin allowlist tightening strategy |
| B-18 | Confirmed | Medium | Candidate Frontend | Mutation rollback + user error feedback |
| B-10 | Deferred | N/A | Deferred | Third-party script hardening decision |
| B-17 | Deferred | N/A | Deferred | Rate limiter storage architecture (Redis/etc.) |
| B-19 | Deferred | N/A | Deferred | HR PWA product scope and delivery plan |

## Phase Plan

### Phase 0: Preflight and Baseline
- Run and record:
  - `npm run build` in `backend`
  - `npm run build` in `candidate`
  - `npm run build` in `hr`
- Capture baseline warnings/errors before remediation.
- Confirm current API behavior on target endpoints to avoid accidental contract breaks.

### Phase 1: P0 Security and Data Integrity
- `B-01`: Replace hardcoded seed admin password with env-driven secret; enforce fail-fast in non-dev when missing.
- `B-02`: Add authz checks for `GET /api/applications/:id` (candidate own record only; HR/admin scoped by site/rules).
- `B-03`: Enforce offer site ownership for HR before offer update/delete.
- `B-04`: Enforce interview schedule/outcome site ownership and block cross-site HR operations.
- `B-05`: Sanitize interview/admin payloads; never return `candidate.passwordHash`.
- `B-06`: Block candidate self-delete if active applications are linked (clear policy error message).
- `B-07`: Block candidate CV deletion when linked to active applications.
- `B-14`: Validate bulk status input, cap batch size, and execute updates transactionally.
- `B-15`: Prevent interview scheduling from overriding terminal application statuses (`accepted`, `rejected`).

### Phase 2: P1 Stability and Performance
- `B-08`: Guard HR auth store `JSON.parse` to prevent startup crash on corrupt storage.
- `B-09`: Guard dual AI analysis parsing with fallback/error-safe handling.
- `B-11`: Implement refresh mutex/queue in candidate axios interceptor to prevent parallel refresh races.
- `B-12`: Align candidate `Application` typing with `appliedAt` and remove invalid date path.
- `B-13`: Add optional pagination for heavy list endpoints with backward-compatible defaults.
- `B-16`: Tighten CORS policy to explicit allowlist and controlled localhost behavior.
- `B-18`: Add optimistic mutation rollback and visible failure feedback in candidate notifications store.

### Phase 3: Verification and Regression
- Backend verification:
  - cross-site authz tests for applications/offers/interviews
  - bulk-status validation and transaction behavior tests
  - seed secret behavior test (with and without env var)
- Frontend verification:
  - HR startup with corrupted auth payload in storage
  - candidate concurrent 401 refresh flow (single refresh call)
  - application card date rendering from `appliedAt`
  - notification rollback + feedback on API failure
- Final acceptance:
  - builds pass in `backend`, `candidate`, `hr`
  - no `passwordHash` leakage in interview/admin responses
  - paginated endpoints remain backward-compatible when pagination params are omitted

## Public API / Interface Changes
- Add optional pagination query parameters (`limit`, `cursor` where relevant) on selected heavy endpoints.
- Keep legacy behavior as default when pagination parameters are absent.
- Enforce stronger authorization semantics (`403`) for cross-site/cross-owner access attempts.
- Update candidate frontend type contract to include `appliedAt` while preserving existing fields used by current UI flows.

## Deferred (Out of This Pass)
- `B-10` Puter.js script hardening (SRI/runtime trust model) pending product/security decision.
- `B-17` Distributed/persistent rate limiter architecture.
- `B-19` HR PWA installability/offline package.

## Assumptions
- No new infra component introduction in this pass (for example Redis or CDN migration).
- Any unavoidable security-driven response changes are allowed; otherwise contracts stay stable.
- Implementation agent may update only `implementation_plan.md`, `tasks.md`, and files directly needed to execute listed tasks.
