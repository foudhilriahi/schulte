# Schulte Tunisia — Recruitment & Application Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Final Year Engineering Project (PFE)**  
A full-stack intelligent recruitment platform built for Schulte Automotive Tunisia — Bouarada & Zaghouan plants.

</div>

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Architecture](#architecture)
- [Applications](#applications)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Database Schema](#database-schema)
- [Real-Time System](#real-time-system)
- [AI Pipeline](#ai-pipeline)
- [Security](#security)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Design Patterns](#design-patterns)

---

## Overview

Schulte Automotive Tunisia is a subsidiary of Schulte & Co. GmbH, a German automotive supplier specialized in cable assemblies and electrical components. The company operates two production plants in Tunisia — Bouarada (Siliana) and Zaghouan — employing over 300 workers combined.

This platform is a private internal system built to digitize and streamline the entire recruitment process for both plants. It replaces a broken workflow where Tunisian candidates were redirected to a German application form referencing institutions that do not exist in Tunisia, with no job board, no candidate tracking, and no structured HR pipeline.

The platform consists of three separate applications sharing one backend, designed to serve three distinct user groups: the developer as system administrator, HR managers at each plant, and job candidates applying through a mobile-accessible web app.

---

## The Problem

Before this platform, the recruitment workflow at Schulte Tunisia had the following critical gaps:

- Clicking "Apply Now" on the Tunisian website redirected candidates to a German-language form referencing the *Agentur für Arbeit* and *Jobcenter* — institutions that do not exist in Tunisia.
- HR managers at Bouarada and Zaghouan had no way to post job offers digitally.
- All applications arrived in a single German email inbox with no pipeline, no tracking, and no audit trail.
- CV review was entirely manual and inconsistent across HR managers.
- Candidates received no feedback after applying — no status updates, no interview details, no rejection notifications.
- There was no data separation between the two plants.
- HR managers recreated the same job descriptions from scratch every time a recurring position opened.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENTS                          │
│                                                         │
│   /admin (Next.js)   /hr (Next.js)   / (Next.js PWA)   │
│   Admin Dashboard    HR Dashboard    Candidate App      │
└──────────────┬───────────────┬───────────────┬──────────┘
               │               │               │
               └───────────────┼───────────────┘
                               │ HTTP + WebSocket
                               v
┌─────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js)                   │
│                                                         │
│   Express REST API    Socket.io Server    node-cron      │
│   Prisma ORM          EventEmitter        Nodemailer     │
│   Multer + pdf-parse  Gemini AI           winston        │
└───────────────────────────┬─────────────────────────────┘
                            │
                            v
              ┌─────────────────────────┐
              │   PostgreSQL Database   │
              │   (local install)       │
              └─────────────────────────┘
```

One backend serves all three frontends. Access is controlled by JWT role (`admin`, `hr`, `candidate`) and site scope (`bouarada`, `zaghouan`). The same endpoint returns different data depending on who is calling it.

---

## Applications

### Admin Dashboard `/admin`

A private management interface used exclusively by the developer. Provides full control over HR accounts and the job template library. There is no public registration — the admin account is seeded once via `npx prisma db seed`.

Capabilities:
- Create, edit, and deactivate HR manager accounts
- Assign HR managers to a specific plant (Bouarada or Zaghouan)
- Reset HR passwords directly
- Manage the job offer template library (add, edit, deactivate)
- View system-wide overview statistics

### HR Dashboard `/hr`

A desktop web application for HR managers. Each HR manager is scoped to their assigned plant — they cannot see or interact with data from the other site.

Capabilities:
- Create job offers from pre-built templates or from scratch
- Manage offers (edit, pause, close)
- Review all incoming applications on a drag-and-drop Kanban board
- View candidate profiles with an embedded PDF CV viewer
- Run AI-powered CV analysis (match score, strengths, gaps, recommendation)
- Add private notes, star ratings, and tags to candidate profiles
- Schedule interviews with automatic candidate notification and calendar file attachment
- Mark interview outcomes (pass, fail, no-show)
- View all scheduled interviews on a weekly calendar
- Receive new application cards in real time via Socket.io

### Candidate PWA `/`

A mobile-first Progressive Web App accessible via any browser. Installable on Android home screen without the Play Store. Candidates can apply to positions at either plant regardless of their location.

Capabilities:
- Register with a Tunisian phone number and password
- Browse all open job offers across both plants
- View AI match score before applying
- Apply via PDF upload or a structured multi-step form
- Generate a downloadable PDF CV from form data (Modern or Classic template)
- Track application status in real time via an animated timeline stepper
- Receive interview scheduling details and prep notes
- View notifications without needing an email address

---

## Tech Stack

### Frontend (all three apps)

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework for all three applications |
| Tailwind CSS | Utility-first styling, shared design tokens |
| shadcn/ui | Component library (Dialog, Table, Badge, Drawer, etc.) |
| Framer Motion | Animations — Kanban drag, timeline stepper, page transitions |
| Zustand | Global state management (auth, notifications, socket) |
| TanStack Query | Server state, caching, optimistic updates |
| React Hook Form + Zod | Form validation with schema-defined rules |
| Axios | HTTP client with JWT silent refresh interceptor |
| socket.io-client | Real-time connection to backend |
| jsPDF | Client-side PDF CV generation — zero server cost |
| next-pwa | Service worker and PWA manifest (candidate app only) |
| dnd-kit | Drag-and-drop Kanban board (HR app only) |
| react-pdf | Embedded PDF viewer in candidate drawer (HR app only) |
| Recharts | Analytics charts (HR app only) |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| Prisma ORM | Type-safe database access and migrations |
| PostgreSQL | Primary database (installed locally, no Docker) |
| Socket.io | Bidirectional real-time communication |
| Multer | File upload handling with type and size validation |
| pdf-parse | Server-side text extraction from uploaded CVs |
| Google Gemini 1.5 Flash | AI CV analysis (backend fallback layer) |
| Nodemailer + Gmail SMTP | Automated email notifications |
| node-cron | Scheduled D-1 interview reminders |
| bcrypt | Password hashing (cost factor 12) |
| jsonwebtoken | JWT access token generation and verification |
| helmet | Secure HTTP response headers |
| express-rate-limit | Brute-force protection on auth endpoints |
| joi | Request body schema validation |
| winston | Structured application and security logging |
| uuid | UUID-based file naming (path traversal prevention) |

---

## Key Features

### Job Offer Template Library

The German Schulte website lists 7 standard positions. These are seeded into the database as reusable templates. When HR creates a new offer, they select a template and the title, description, and suggested skills are pre-filled automatically. HR only needs to add the contract type, salary range, deadline, and number of seats.

This reduces offer creation time from approximately 15 minutes to under 2 minutes for recurring positions.

The 7 seeded templates:

| French Title | English Reference |
|---|---|
| Planificateur de Production | Production Planner |
| Acheteur Strategique | Strategic Purchaser |
| Chef d'Equipe Achats | Team Leader Purchasing |
| Mecanicien Industriel Production | Industrial Mechanic Production |
| Operateur de Machines | Machine and Plant Operator |
| Technicien Electronique | Electronics Technician |
| Responsable Ressources Humaines | HR Officer |

Admin manages all templates. HR can use them but cannot modify or delete them.

### AI CV Analysis

When HR clicks "Analyse" on a candidate profile, the system runs a two-layer AI pipeline:

1. **Primary** — Puter.js calls GPT-4o from the Next.js browser. Free, requires no API key, no billing.
2. **Fallback** — If Puter.js fails or exceeds the 8-second timeout, the backend calls Google Gemini 1.5 Flash automatically.

The AI receives the CV text (extracted from PDF or assembled from form data), the job title, required skills, experience requirements, and description. It returns a structured JSON response:

```json
{
  "score": 76,
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendation": "Interview",
  "tips_for_candidate": ["..."]
}
```

HR sees the full analysis. The candidate sees the match score and two improvement tips. The result is stored in the database and served from there on subsequent views — the AI is not called again unless HR explicitly re-analyses.

### Real-Time Sync via Socket.io

All three applications are connected via Socket.io. Clients join named rooms on authentication and receive targeted events.

The most visible example: HR drags a Kanban card to "Under Review" — the candidate's phone updates the timeline stepper to reflect the new status without any page refresh. Both screens react to a single action in real time.

### Progressive Web App

The candidate application is configured as a PWA via `next-pwa`. On Android, candidates are prompted to install it to their home screen. Once installed, it opens full-screen with no browser chrome, functions offline (cached shell), and displays a notification badge for unread status updates — all without going through the Play Store.

### Automated Notification Pipeline

Every application status change triggers an automatic notification pipeline via the Observer pattern. HR never writes a notification manually.

On every status change:
1. Socket.io push to the candidate's personal room (instant, no email required)
2. Write to the notifications table (bell icon in the PWA)
3. Nodemailer email (only if the candidate has an email address)

For interview scheduling, the email includes an `.ics` calendar attachment compatible with Google Calendar, Apple Calendar, and Outlook.

A `node-cron` job runs every hour and sends D-1 reminders to candidates with interviews scheduled 20–28 hours from the current time.

---

## Database Schema

Seven tables. All relationships enforced at the database level. Soft deletes on users, offers, and templates.

```
users
  id, role, name, email (nullable), phone (nullable),
  password_hash, site (nullable), is_active, created_at, deleted_at

refresh_tokens
  id, user_id, token_hash (SHA-256), expires_at, created_at

offer_templates
  id, title_fr, title_en, description, suggested_skills[],
  is_active, created_by, updated_at, deleted_at

job_offers
  id, template_id (nullable), site, title, description,
  contract_type, required_skills[], experience_years,
  salary_range (nullable), show_salary, seats, deadline,
  status (open/paused/closed), created_by, created_at, deleted_at

applications
  id, offer_id, candidate_id, cv_url, cv_text, form_data (JSONB),
  cv_template, status (new/reviewing/interview/accepted/rejected),
  ai_score, ai_analysis (JSONB), hr_notes, hr_rating, hr_tags[],
  applied_at, updated_at
  UNIQUE (offer_id, candidate_id)

interviews
  id, application_id, scheduled_at, location,
  notes_for_candidate, reminder_sent, outcome (pass/fail/no_show),
  created_by, created_at

notifications
  id, user_id, application_id, type, payload (JSONB),
  email_sent, read_at (nullable), created_at
```

---

## Real-Time System

### Rooms

| Room | Members | Purpose |
|---|---|---|
| `offers:public` | All connected candidates | Broadcast new and closed offers |
| `site:{site}` | HR managers per site | Site-scoped events |
| `hr:{id}` | Specific HR manager | New application alerts |
| `candidate:{id}` | Specific candidate | Status updates, interview details, reminders |
| `admin` | Admin session | System-wide events |

### Event Map

| Event | Emitted By | Received By | Effect |
|---|---|---|---|
| `offer:new` | HR publishes offer | `offers:public` | Offer card appears in PWA without refresh |
| `offer:closed` | HR closes offer | `offers:public` | Offer disappears from PWA |
| `application:new` | Candidate submits | `hr:{id}` | Kanban card appears in HR dashboard |
| `status:changed` | HR moves Kanban card | `candidate:{id}` | Timeline stepper updates, notification bell increments |
| `interview:scheduled` | HR schedules interview | `candidate:{id}` | Interview card appears in PWA, email with `.ics` sent |
| `interview:reminder` | `node-cron` D-1 | `candidate:{id}` | Reminder banner in PWA, reminder email sent |
| `template:updated` | Admin edits template | All HR connections | New Offer modal refreshes template list |

---

## AI Pipeline

```
HR clicks "Analyse"
        |
        v
Frontend calls POST /api/applications/:id/analyse
        |
        v
Backend fetches cv_text (from PDF extraction or assembled form fields)
        |
        v
Constructs prompt:
  - CV text (French, Arabic, or English — handled natively)
  - Offer title + required skills + experience years + description
        |
        v
Try Puter.js (GPT-4o) from Next.js browser -- 8s timeout
        |
   success? --> parse JSON --> save to DB --> return to frontend
        |
   timeout or error?
        |
        v
Try Google Gemini 1.5 Flash from Node.js backend
        |
   success? --> parse JSON --> save to DB --> return to frontend
        |
   error?
        |
        v
Return 503 -- "AI analysis currently unavailable"
HR can still review the candidate manually, no blocking error
```

---

## Security

This application implements the OWASP Top 10 (2021) at every relevant layer.

| Risk | Implementation |
|---|---|
| A01 — Broken Access Control | RBAC middleware on all routes. Server-side site ownership check (`offer.site === req.user.site`) on every mutation — role check alone is not sufficient. |
| A02 — Cryptographic Failures | Passwords hashed with bcrypt (cost factor 12). Refresh tokens stored as SHA-256 hashes in the database — raw tokens exist only in httpOnly cookies. CV files served exclusively through an authenticated route, never directly accessible by URL. |
| A03 — Injection | Prisma parameterizes all queries by default. `$queryRaw` uses tagged template literals only — no string concatenation. |
| A04 — Insecure Design | `express-rate-limit` restricts auth endpoints to 5 attempts per IP per 15 minutes. Returns 429 with `retry-after` header. |
| A05 — Security Misconfiguration | `.env` in `.gitignore`. `helmet.js` sets CSP, HSTS, and X-Frame-Options. `NODE_ENV=production` suppresses stack traces in error responses. |
| A06 — Vulnerable Components | `npm audit` run before submission. `package-lock.json` committed. No wildcard dependency versions. |
| A07 — Authentication Failures | httpOnly cookies prevent JavaScript access to refresh tokens (XSS-safe). All tokens for a user are invalidated immediately on account deactivation. |
| A09 — Logging Failures | `winston` logs failed login attempts, 403 access violations, file upload rejections, and AI errors to persistent log files. |
| XSS | React escapes all rendered output by default. `dangerouslySetInnerHTML` is never used. The embedded PDF viewer runs in a sandboxed iframe. Joi strips HTML from all text inputs server-side. |
| Path Traversal | Multer discards the original filename entirely. Every uploaded file is renamed to a UUID (`uuid.pdf`) before being written to disk. |

### Input Validation — CV Upload Edge Cases

| Scenario | Handling |
|---|---|
| Wrong file type | `fileFilter` in Multer rejects before the file reaches disk |
| File over 5MB | `limits.fileSize` in Multer rejects before processing |
| Empty or blank PDF | `cv_text.length < 50` check returns 400 with a user-facing message |
| Scanned PDF (image-only, no text layer) | `pdf-parse` returns an empty string — caught by the same empty check |
| Corrupted PDF | `pdf-parse` throws — caught, file deleted, 400 returned |
| French CV with embedded photo | `pdf-parse` extracts text only, images are silently ignored |
| Non-Tunisian phone number | Validated by `/^(2|4|5|7|9)\d{7}$/` on the frontend and by Joi schema on the backend |
| Duplicate application | `UNIQUE(offer_id, candidate_id)` constraint returns 409 |
| Application to a closed offer | `offer.status === 'open'` checked before creating the application |

---

## Project Structure

```
schulte-tunisia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── events/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── server.ts
│   ├── uploads/
│   ├── logs/
│   └── .env
├── admin-dashboard/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── store/
│   └── hooks/
├── hr-dashboard/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── store/
│   └── hooks/
├── candidate-pwa/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── store/
│   └── hooks/
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL installed and running locally
- A Gmail account with App Password enabled (for email notifications)
- A Google Gemini API key (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/foudhilriahi/schulte.git
cd schulte-tunisia
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in all values in .env before continuing
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

The seed script creates the admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, and inserts the 7 job offer templates aligned with the German Schulte site.

### 4. Start the backend

```bash
npm run dev
# Server runs on http://localhost:4000
```

### 5. Set up and start the admin dashboard

```bash
cd ../admin-dashboard
npm install
npm run dev
# Runs on http://localhost:3001
```

### 6. Set up and start the HR dashboard

```bash
cd ../hr-dashboard
npm install
npm run dev
# Runs on http://localhost:3002
```

### 7. Set up and start the candidate PWA

```bash
cd ../candidate-pwa
npm install
npm run dev
# Runs on http://localhost:3000
```

### 8. Log in

- Admin: `http://localhost:3001` — use the email and password set in `.env`
- HR: `http://localhost:3002` — use an account created from the admin dashboard
- Candidate: `http://localhost:3000` — register with a Tunisian phone number

---

## Environment Variables

```bash
# backend/.env

DATABASE_URL="postgresql://user:password@localhost:5432/schulte_db"

JWT_SECRET=""
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET=""
REFRESH_TOKEN_EXPIRES_IN="30d"

ADMIN_EMAIL=""
ADMIN_PASSWORD=""

GMAIL_USER=""
GMAIL_APP_PASSWORD=""

GEMINI_API_KEY=""

PORT=4000
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
```

Never commit `.env` to version control. An `.env.example` file with empty values is included in the repository.

---

## Design Patterns

| Pattern | Implementation |
|---|---|
| Repository | `UserRepo`, `OfferRepo`, `TemplateRepo`, `ApplicationRepo` — all database access isolated from controllers |
| MVC | Express: Routes → Controllers → Repositories. Business logic never touches Prisma directly. |
| Observer | Node.js `EventEmitter` — controllers emit domain events, `notificationService` handles Socket.io, email, and database writes independently |
| Strategy | `PuterStrategy` and `GeminiStrategy` both implement `AIAnalyser`. Provider swapped in one config change. |
| Factory | `CVFactory.create('modern' | 'classic', data)` — new CV templates added without touching generation logic |
| Template Method | `TemplateOfferCreation` and `ScratchOfferCreation` share the same validation and publish pipeline |
| RBAC + Ownership | `requireRole` middleware enforces role. `requireSiteOwnership` enforces site scope on every mutation. |
| Room-based Pub/Sub | Socket.io named rooms ensure events reach only the correct recipients — no cross-user leakage |

---

## Academic Context

This platform was developed as a Final Year Engineering Project (Projet de Fin d'Etudes). It addresses a real operational gap identified through direct analysis of the company's public-facing website and its Tunisian recruitment workflow.

The project demonstrates applied knowledge of full-stack web development, real-time systems, AI integration, relational database design, security engineering (OWASP Top 10), and software design patterns across a production-grade multi-application architecture.


**Academic Year:** 2025-2026  
**Institution:** UAS

---

<div align="center">
Schulte Automotive Tunisia Sarl — Bouarada & Zaghouan
</div>