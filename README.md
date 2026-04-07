# Schulte Tunisia Recruitment Platform

Private internal recruitment platform built for Schulte Automotive Tunisia (Bouarada and Zaghouan plants).

## Project Summary

This platform digitizes the full recruitment lifecycle:
- publishing and managing job offers,
- receiving and tracking applications,
- AI-assisted CV analysis,
- interview scheduling and follow-up,
- candidate real-time status visibility.

It is organized as a monorepo with one backend and two frontends:
- `candidate` app (Next.js PWA) for candidates,
- `hr` app (React + Vite) for HR and Admin interfaces,
- `backend` API (Express + Prisma + Socket.io).

## Current Architecture

```text
+---------------------+        +-------------------+
| Candidate App       |        | HR/Admin App      |
| Next.js (PWA)       |        | React + Vite      |
| /                   |        | /login, /, /admin |
+----------+----------+        +---------+---------+
           |                             |
           +-------------+---------------+
                         | HTTP + Socket.io
                         v
                +--------+---------+
                | Backend API      |
                | Express + Prisma |
                | Socket.io + Cron |
                +--------+---------+
                         |
                         v
                   PostgreSQL DB
```

## Applications and Roles

### Candidate App (`candidate`)
- Public-facing mobile-first app.
- Candidate registration/login.
- Browse open offers.
- Apply using CV upload or CV builder.
- Track application status and interview notifications.
- Installable as PWA.

### HR/Admin App (`hr`)
- Single frontend with role-based areas.
- HR users manage offers, candidates, Kanban, interviews.
- Admin users manage HR accounts, reset HR passwords, manage templates, send broadcast notifications.
- Site scoping enforced for HR actions (Bouarada/Zaghouan).

### Backend (`backend`)
- REST API for auth, offers, applications, interviews, notifications, CVs, admin.
- JWT auth + refresh tokens in httpOnly cookie.
- Prisma/PostgreSQL persistence.
- Socket.io for real-time updates.
- Cron jobs for interview reminders.

## Core Business Logic (High-Level)

### 1. Authentication and Session Model
- Login with email/password for all roles.
- Access token used for API authorization.
- Refresh token stored as secure httpOnly cookie and rotated on refresh.
- HR self-password change is disabled in app UX; Admin handles HR resets.

### 2. Application Lifecycle
- Candidate submits application from selected/default CV.
- Backend stores immutable CV snapshot for audit consistency.
- Status progression:
  - `new` -> `reviewing` -> `interview` -> `accepted` or `rejected`
- Backend normalizes legacy `review` input to `reviewing` and rejects invalid statuses.

### 3. Interview Workflow
- HR schedules interview with date, location, notes.
- Candidate receives in-app notification and optional email.
- Outcome updates final application status (`pass/fail/no_show` mapping handled by backend flow).

### 4. Admin Governance
- Admin creates/deactivates HR accounts.
- Admin resets HR passwords.
- Session revocation is applied when credentials or account state changes.

## Real-Time System (Socket.io)

The backend assigns each connected user to rooms based on role and site.

### Room Model
- `user:{id}`: personal room for any user.
- `candidate:{id}`: candidate-specific compatibility room.
- `hr:{id}`: HR/Admin personal HR room.
- `site:{site}`: site-scoped room (`Bouarada`, `Zaghouan`).
- `admin`: admin-only room.

### Typical Event Flow
- Candidate submits application -> HR/site receives new candidate card event.
- HR changes status -> candidate timeline updates in real time.
- HR schedules interview -> candidate receives interview event.
- Admin updates template -> HR users receive template refresh event.
- Admin changes HR accounts -> admin dashboards receive overview/account update events.

## Tech Stack

### Frontend
- Candidate: Next.js 15, React 19, Tailwind, TanStack Query, Zustand, next-pwa.
- HR/Admin: React 18 + Vite, Tailwind, TanStack Query, Zustand, Socket.io client.

### Backend
- Node.js, Express, Prisma, PostgreSQL, Socket.io.
- Security and platform: helmet, cors, joi, bcryptjs, jsonwebtoken, cookie-parser.
- File and processing: multer, pdf-parse.
- Notifications and jobs: nodemailer, node-cron.


## Security Highlights

- JWT-based auth with role checks on protected routes.
- Refresh tokens stored hashed in DB and sent as httpOnly cookies.
- Site ownership checks on HR data mutations.
- Password hashing with bcrypt.
- Validation middleware on critical payloads.
- Account deactivation and password resets invalidate sessions.

## Diagrams and Report Assets

Technical diagrams for architecture, sequences, states, and workflows are available in:
- `diagramms/`


## Private Project Notice

This repository is private internal work prepared in an academic/professional context . It is not intended as a public SaaS product.
