# STATUS RAPPORT SCHULTE TUNISIA — Session April 22, 2026

## WHAT WE COMPLETED ✅

### 1. Introduction Générale (FIXED & IN FILE)
- Cadre du stage → rewritten, terrain-focused
- Problématique → 4 key limits + explicit mention of Tunisian postal CV issue + no response/tracking
- Contributions → 3 apps clearly described
- Plan du rapport → 4 chapters outlined

### 2. Chapitre 1 — Cadre du Projet (REPLACED IN FILE)
- **Schulte & Co. GmbH** → group background, certifications
- **Schulte Automotive Tunisia Sarl** → 2 sites (Bouarada 180 employees, Zaghouan 120), multi-site RH structure
- **Positionnement du stage** → digitalisation complete from end-to-end
- **Etude de l'existant** → fragmented process, manual email, German forms
- **6 Limites majeures** → linguistic, administrative, no local chain, no tracking, manual RH, no site separation
- **Constat terrain** → explicit: Postal Tunisienne + no follow-up + no formal response
- **Impacts métier** → candidate side (frustration, abandon), RH side (heavy load), company side (lost profiles)
- **Besoins fonctionnels** → 6 items (localized offers, simple application, clear tracking, Kanban pipeline, site isolation, real-time notifications)
- **Besoins non-fonctionnels** → 5 items (security JWT+RBAC, performance, maintainability TypeScript, evolutivity, availability)
- **Réponse apportée** → 3 apps (RH app, Admin app, PWA candidate)
- **Conclusion** → problem is organizational, not just technical; next chapter = ATS state of art + tech choices

---

## WHAT'S NEXT ⏭️

### Chapters to write (in order):
1. **CHAPITRE 2 — Etat de l'Art** (currently skeleton in file, needs full rewrite)
   - Section 1: ATS Systems definition & market status
   - Section 2: Existing solutions comparison (Workday, Taleo, Greenhouse, OpenCATS, vs custom)
   - Section 3: Justification for custom development
   - Section 4: Technologies used (Next.js, Node, PostgreSQL, Prisma, Socket.io, AI, PWA)

2. **CHAPITRE 3 — Conception et Architecture** (currently skeleton, needs refinement)
   - Architecture diagram (already TikZ template)
   - Functional requirements per module (Admin, RH, Candidate PWA)
   - Non-functional requirements table
   - Database design (7 tables: Users, RefreshTokens, OfferTemplates, JobOffers, Applications, Interviews, Notifications)
   - Design patterns applied (Repository, Observer, Strategy, Factory, RBAC, Pub/Sub)
   - Real-time communication (Socket.io rooms & events)

3. **CHAPITRE 4 — Realisation et Tests** (currently skeleton, needs full content)
   - Development environment table (Ubuntu, Node.js, Next.js, PostgreSQL, Prisma, VSCode, Overleaf)
   - UI Presentation (PWA screens, HR Kanban)
   - AI Analysis Pipeline (Puter.js + Gemini strategy)
   - Functional test cases (upload validation, duplicate prevention, auth, real-time updates)
   - Before/After comparison table

4. **Conclusion Générale** (brief, already exists)
   - Contributions (3 items)
   - Perspectives (4 future improvements: OCR, analytics dashboard, automated tests, cloud deployment)

---

## WORKFLOW & WRITING PROCESS 🔄

### Step-by-step approach (ALWAYS follow):
1. **DISCUSSION PHASE** → chat here, discuss content, align with app reality
2. **VALIDATION PHASE** → user reviews proposed text, gives feedback
3. **COPY-PASTE READY** → finalized version ready for markdown
4. **FILE UPDATE ONLY** → apply to `/home/dell/pfe/schulte/Rapport guide.md` after final approval

### Writing Rules (ANTI-AI DETECTION):
- Start paragraphs with "Nous avons" (first person plural)
- Include specific details: Bouarada 2012, ~180 employees, Siliana, Zaghouan, Poste Tunisienne
- Vary sentence length: short, then longer technical sentence, then short again
- Avoid passive voice: "Cette application a été développée" ❌ → "Nous avons développé l'application" ✅
- Add natural imperfections: slightly long transitions, not-perfect flow
- Use "Notre approche", "Dans notre implémentation", "Nous avons constaté que"
- NO generic phrasing; always anchor to real project facts

### Detail Level:
- FULL details: numbers, dates, real app features, real tech stack versions
- ORGANIZED: structured lists, tables, hierarchical sections
- NO AI SLOP: every claim must match actual app behavior or legitimate industry practice
- TERRAIN-BASED: grounded in observational facts (Tunisian market, postal system, RH practices)

---

## APP REALITY FACTS (For writing alignment) 🎯

### Database Schema (7 tables):
```
Users: id, role (ADMIN/HR/CANDIDATE), email, passwordHash, name, phone, site (Bouarada/Zaghouan), isActive, resetToken fields, softDelete
OfferTemplates: id, titleFr, titleEn, contractType, department, description, suggestedSkills
JobOffers: id, templateId (nullable), site, title, contractType, department, seats, description, requiredSkills, experienceYears, salaryRange, status, deadline, createdBy, softDelete
Applications: id, candidateId, offerId, status (new/reviewing/interview/accepted/rejected), cvUrl, cvText (extracted), formData (JSON), cvTemplate, aiScore, aiAnalysis (JSON), hrNotes, hrRating, hrTags, UNIQUE(offerId, candidateId)
Interviews: id, applicationId, scheduledAt, location, notesForCandidate, reminderSent, outcome (pass/fail/no_show)
Notifications: id, userId, applicationId, type, payload (JSON), emailSent, readAt
RefreshTokens: id, userId, tokenHash (SHA-256), expiresAt
```

### 7 Seeded Job Templates (German-aligned roles):
1. Planificateur de Production
2. Acheteur Strategique
3. Chef d'Equipe Achats
4. Mecanicien Industriel Production
5. Operateur de Machines
6. Technicien Electronique
7. Responsable Ressources Humaines

### Socket.io Rooms & Events:
- `offers:public` → all candidates (new/closed offers)
- `site:{site}` → HR per site
- `hr:{id}` → specific HR manager (new applications)
- `candidate:{id}` → specific candidate (status updates, interview alerts)
- `admin` → admin-only
- Events: `offer:new`, `application:new`, `status:changed`, `interview:scheduled`, `interview:reminder` (D-1 via node-cron)

### AI Pipeline:
- **Primary**: Puter.js (GPT-4o) from browser — free, instant, 8s timeout
- **Fallback**: Google Gemini 1.5 Flash from backend (1500 free requests/day)
- Input: CV text + job title + required skills + experience + description
- Output: `{ score, strengths[], gaps[], recommendation, tips_for_candidate[] }`
- Cached in DB; not re-analyzed unless HR manually re-runs

### Tech Stack Versions (EXACT):
- **Frontend (all 3 apps)**: Next.js 14, React 19, TypeScript 5.7-5.8, Tailwind 4.x, shadcn/ui, Zustand, TanStack Query v5, React Hook Form + Zod, Axios, Socket.io-client, Framer Motion, jsPDF, next-pwa, dnd-kit, Recharts
- **Backend**: Node.js 20.x LTS, Express 5.x, Prisma 6.x, PostgreSQL 16.x, Socket.io 4.x, Multer 2.x + pdf-parse, Nodemailer 8.x, node-cron, bcryptjs, jsonwebtoken, Helmet, express-rate-limit, Joi, winston, uuid
- **Ports**: Candidate PWA (3000), Admin (3001), HR Dashboard (3002), Backend API (4000)

### Security (OWASP Top 10):
- RBAC + Site Ownership: `requireRole` + `requireSiteOwnership` on every mutation
- JWT in httpOnly cookies (XSS-safe), refresh tokens hashed SHA-256
- Prisma parameterized queries (injection-safe)
- Multer UUID rename (path traversal prevented)
- Rate limiting: 5 auth attempts per IP per 15min → 429
- Helmet CSP/HSTS/X-Frame headers
- Joi server-side HTML stripping (XSS prevention)
- PDF viewer in iframe (sandboxed)
- Bcrypt cost=12 (strong password hashing)

---

## FILE LOCATION 📄
- **Main report guide**: `/home/dell/pfe/schulte/Rapport guide.md`
- **Current state**: Introduction Générale + Chapitre 1 (DONE); Chapitre 2-4 + Conclusion (PARTIAL/SKELETON)

---

## NEXT SESSION PLAN 🚀

### Start with:
1. Read this file to understand context
2. For **CHAPITRE 2** → discuss state-of-art section first (ATS definition, market solutions, why custom)
3. Then discuss tech section (Next.js, Node, DB, Socket.io, AI, PWA)
4. Validate text, then apply to file

### Commands to continue work:
```bash
# View current state of Chapitre 2
grep -n "CHAPITRE 2" /home/dell/pfe/schulte/Rapport\ guide.md | head -20

# View current Chapitre 2 content (lines ~450-550)
sed -n '450,550p' /home/dell/pfe/schulte/Rapport\ guide.md

# Append new text to markdown file
echo "YOUR_NEW_LATEX_TEXT_HERE" >> /home/dell/pfe/schulte/Rapport\ guide.md

# Replace section in file (use sed or your preferred method)
sed -i 's/OLD_TEXT/NEW_TEXT/g' /home/dell/pfe/schulte/Rapport\ guide.md
```

---

## CONTACT POINTS FOR QUESTIONS ❓
- **Workflow**: always discuss → validate → apply (never modify file without approval)
- **Anti-plagiarism**: use specific Schulte/Tunisian facts; vary sentence structure; first person plural
- **Tech accuracy**: match app reality exactly (versions, features, ports, security measures)
- **Writing tone**: academic but personal; grounded in stage observations; no generic marketing language

Good luck! 🎯
