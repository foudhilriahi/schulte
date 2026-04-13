# Rapport Technique - Plateforme de Recrutement Schulte Tunisia

## Implémentation Low-Code Détaillée

**Date:** Avril 2026  
**Projet:** Schulte Tunisia - Plateforme de Recrutement Multi-Applications  
**Entreprise:** Schulte Tunisia (Manufacture automobile - Sites: Bouarada & Zaghouan)

---

## Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Architecture Globale](#2-architecture-globale)
3. [Backend - API & Services](#3-backend---api--services)
4. [HR/Admin - Portail Interne](#4-hradmin---portail-interne)
5. [Candidate PWA - Application Mobile](#5-candidate-pwa---application-mobile)
6. [Communication Inter-Applications](#6-communication-inter-applications)
7. [Patterns Low-Code Identifiés](#7-patterns-low-code-identifiés)
8. [Base de Données](#8-base-de-données)
9. [Sécurité](#9-sécurité)
10. [Temps Réel & Automatisations](#10-temps-réel--automatisations)
11. [Intelligence Artificielle](#11-intelligence-artificielle)
12. [Déploiement & Configuration](#12-déploiement--configuration)

---

## 1. Vue d'Ensemble

### 1.1 Description du Projet

Plateforme de recrutement complète permettant la gestion des offres d'emploi, candidatures, entretiens et évaluations IA pour Schulte Tunisia. Le système est composé de trois applications distinctes partageant un backend unique.

### 1.2 Applications

| Application | Stack | Port | Objectif |
|-------------|-------|------|----------|
| **Backend** | Express.js + TypeScript + Prisma + PostgreSQL | 5000 | API REST + WebSocket |
| **HR/Admin** | React + Vite + TypeScript + shadcn/ui | 8080 | Portail RH interne |
| **Candidate PWA** | Next.js 15 + TypeScript + PWA | 3000 | PWA publique pour candidats |

### 1.3 Caractéristiques Techniques

- **Multi-rôle:** ADMIN, HR, CANDIDATE
- **Multi-site:** Bouarada, Zaghouan
- **Temps réel:** Socket.IO pour notifications et mises à jour
- **IA multi-modèle:** Gemini + OpenRouter avec consensus
- **PWA:** Application installable avec support offline
- **Email:** Notifications automatisées avec pièces jointes ICS
- **Kanban:** Interface drag-and-drop pour gestion candidatures

---

## 2. Architecture Globale

### 2.1 Diagramme d'Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   HR/Admin SPA  │     │ Candidate PWA    │     │    Backend       │
│   React + Vite  │     │ Next.js 15 + PWA │     │  Express.js + TS │
│   Port 8080     │     │ Port 3000        │     │  Port 5000       │
└────────┬────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                       │                         │
         │  REST API + Socket    │  REST API + Socket      │
         └───────────────────────┼─────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────┐
                    │   PostgreSQL DB    │
                    │   Prisma ORM       │
                    └────────────────────┘
```

### 2.2 Stack Technologique par Application

#### Backend
- **Runtime:** Node.js avec Express.js 5.x
- **Langage:** TypeScript (ES2022, CommonJS)
- **ORM:** Prisma 6.x avec PostgreSQL
- **Temps réel:** Socket.IO 4.x
- **Authentification:** JWT (access + refresh tokens), bcryptjs
- **Validation:** Joi schemas
- **IA:** Google Gemini API + OpenRouter (moteur de consensus multi-modèle)
- **Email:** Nodemailer avec pièces jointes ICS
- **Upload:** Multer (PDF uniquement, 5MB)
- **Logging:** Winston
- **Cron:** node-cron

#### HR/Admin
- **Build:** Vite 5.x avec React 18
- **UI:** shadcn/ui (49 composants) + Radix UI
- **Style:** Tailwind CSS 3.x avec thème personnalisé
- **Police:** Inter (Google Fonts)
- **État:** Zustand (auth), TanStack Query 5 (état serveur)
- **Routing:** React Router DOM 6
- **Temps réel:** Socket.IO client
- **Formulaires:** React Hook Form + Zod
- **Graphiques:** Recharts
- **Drag & Drop:** @hello-pangea/dnd (Kanban)
- **Virtualisation:** @tanstack/react-virtual
- **Tests:** Vitest + React Testing Library

#### Candidate PWA
- **Framework:** Next.js 15.5.x avec App Router (React 19)
- **PWA:** @ducanh2912/next-pwa (service worker, manifest, offline)
- **Langage:** TypeScript (ESNext)
- **UI:** shadcn/ui (style New York) + Radix UI
- **Style:** Tailwind CSS 4.x
- **État:** Zustand (auth, notifications), TanStack Query 5
- **Formulaires:** React Hook Form + Zod
- **Temps réel:** Socket.IO client avec reconnexion
- **Graphiques:** Recharts
- **Génération CV:** jsPDF (génération PDF côté client)
- **Analytics:** @vercel/analytics

---

## 3. Backend - API & Services

### 3.1 Architecture en Couches

```
server.ts
  ├── config/         (env.ts, prisma.ts)
  ├── middleware/      (authenticate, requireRole, requireSite, validate, rateLimiter, schemas, errorHandler)
  ├── routes/          (9 fichiers de routes)
  ├── controllers/     (8 contrôleurs)
  ├── repositories/    (7 repositories - abstraction Prisma)
  ├── services/        (7 services - logique métier)
  ├── events/          (emitter.ts - EventEmitter typé)
  └── utils/           (logger.ts, ics.ts)
```

### 3.2 Fichiers de Configuration

| Fichier | Description |
|---------|-------------|
| `package.json` | Scripts: dev (tsx watch), build (tsc), start, seed, migrate, generate |
| `tsconfig.json` | Cible ES2022, CommonJS, mode strict, alias `@/*` vers `./src/*` |
| `prisma.config.ts` | Configuration Prisma pointant vers `prisma/schema.prisma` |
| `.env.example` | PORT (5000), DATABASE_URL, secrets JWT, URLs frontend, config SMTP, clés API |

### 3.3 Middleware

| Middleware | Fonction |
|------------|----------|
| `authenticate.ts` | Extraction token Bearer, vérification JWT, attache `AuthPayload` à `req.user` |
| `requireRole.ts` | Autorisation basée sur le rôle (ADMIN, HR, CANDIDATE) |
| `requireSite.ts` | Vérifie que les utilisateurs HR ont un site assigné |
| `validate.ts` | Wrapper de validation Joi pour les requêtes |
| `schemas.ts` | Schémas Joi: register, login, adminCreateHR, templates, profile, etc. |
| `rateLimiter.ts` | Rate limiter IP-based en mémoire |
| `errorHandler.ts` | Gestionnaire d'erreurs Express avec logging Winston |

### 3.4 Contrôleurs (8)

| Contrôleur | Routes | Description |
|------------|--------|-------------|
| `auth.controller.ts` | `/api/auth` | register, login, refresh, logout, me, forgot/reset password |
| `admin.controller.ts` | `/api/admin` | CRUD comptes HR, CRUD templates, broadcast, overview |
| `offers.controller.ts` | `/api/offers` | Listing public, offres HR avec stats IA, CRUD offres |
| `applications.controller.ts` | `/api/applications` | Candidatures candidat, vue RH par site, mise à jour statut, analyse IA |
| `profile.controller.ts` | `/api/profile` | GET profile, PATCH nom, PATCH mot de passe |
| `interviews.controller.ts` | `/api/interviews` | GET entretiens (par rôle), POST planifier, PATCH outcome |
| `notifications.controller.ts` | `/api/notifications` | GET notifications, unread, mark read, delete |
| `candidate-cv.controller.ts` | `/api/cvs` | GET CVs candidat, upload PDF, CV généré, set default, delete |

### 3.5 Services (7)

| Service | Responsabilités |
|---------|----------------|
| **SocketService** | Initialisation Socket.IO, auth JWT, rooms (user, admin, hr, site, candidate), emit helpers |
| **NotificationService** | Écoute événements `appEmitter`, persistance DB, push Socket.IO, envoi email |
| **CronService** | 3 jobs: rappels entretiens (quotidien 8h), fermeture offres expirées (horaire), alertes expiration (5min) |
| **AIBattleService** | Moteur consensus multi-IA: Gemini (4 modèles) + OpenRouter (2 modèles), fallback keyword matching |
| **AuthService** | Hash bcrypt (12 rounds), génération JWT, refresh tokens (random bytes, SHA-256, 30 jours) |
| **EmailService** | Nodemailer avec templates HTML, 4 types: statut, entretien (ICS), rappel, reset password |
| **UploadService** | Multer PDF uniquement (5MB), noms UUID, extraction texte PDF |

### 3.6 Repositories (7)

Pattern Repository pour abstraction d'accès aux données:

| Repository | Méthodes Clés |
|------------|---------------|
| `user.repository.ts` | CRUD, refresh tokens, findActiveAdminIds, findActiveHRIds |
| `offer.repository.ts` | findAll avec filtres, findById avec compte candidatures |
| `application.repository.ts` | findByCandidate/Offer/Site, create, updateStatus, saveAIResult, checkDuplicate |
| `candidate-cv.repository.ts` | create (auto-default), setDefault (transactionnel), delete |
| `notification.repository.ts` | create, createManyForUsers, markAllRead, countUnread |
| `interview.repository.ts` | findById, findByApplication, findTomorrow (cron), markOutcome |
| `template.repository.ts` | findAll, findActive, findById, create, update, delete |

### 3.7 Points d'API (9 groupes)

| Groupe | Préfixe | Auth | Endpoints Clés |
|--------|---------|------|----------------|
| Auth | `/api/auth` | Mixte | POST /register, /login, /refresh, /logout, /forgot-password, /reset-password; GET /me |
| Admin | `/api/admin` | ADMIN seul | CRUD /hr-accounts, /templates, POST /broadcast-hr, GET /overview, /hr-overview |
| Offres | `/api/offers` | Mixte | GET / (public), GET /:id (public), GET /hr/my-offers (HR), POST/PATCH/DELETE / (HR) |
| Candidatures | `/api/applications` | Mixte | GET /mine (candidat), POST /from-cv (candidat), GET /by-site (HR), PATCH /:id/status (HR), POST /:id/analyse (HR) |
| Profile | `/api/profile` | Auth | GET /, PATCH /, PATCH /password |
| Entretiens | `/api/interviews` | Auth | GET /, POST /, PATCH /:id/outcome (HR/Admin) |
| Notifications | `/api/notifications` | Auth | GET /, GET /unread-count, PATCH /mark-all-read, DELETE /clear-all |
| Uploads | `/api/uploads` | Auth | GET /:filename - serving fichiers avec protection path traversal |
| CVs Candidat | `/api/cvs` | Candidat seul | GET /mine, POST /upload, POST /generated, PATCH /:id/default, DELETE /:id |

### 3.8 Système d'Événements

**`events/emitter.ts`** - EventEmitter typé wrapant Node's EventEmitter:

| Événement | Payload | Déclencheur |
|-----------|---------|-------------|
| `application.statusChanged` | `{ applicationId, oldStatus, newStatus, candidateId }` | Changement statut candidature |
| `interview.scheduled` | `{ interviewId, candidateId, scheduledAt }` | Planification entretien |
| `interview.reminder` | `{ interviewId, candidateId, scheduledAt }` | Rappel entretien |

### 3.9 Utilitaires

| Utilitaire | Description |
|------------|-------------|
| `logger.ts` | Winston logger avec couleurs console, timestamps, stack traces |
| `ics.ts` | Générateur fichiers .ics pour invitations calendrier avec VALARM (rappel 60min) |

---

## 4. HR/Admin - Portail Interne

### 4.1 Architecture SPA basée sur les Features

```
src/
  ├── App.tsx                  — Router + QueryClientProvider + SocketListener
  ├── main.tsx                 — Point d'entrée React
  ├── store/
  │   └── authStore.ts         — Zustand: login/logout/loadFromStorage/updateUser
  ├── lib/
  │   ├── axios.ts             — Instance Axios avec intercepteur token + redirect 401/403
  │   ├── socket.ts            — Singleton Socket.IO avec auth JWT + reconnexion
  │   ├── authSession.ts       — Gestion tokens sessionStorage/localStorage
  │   ├── utils.ts             — Helper cn() (clsx + tailwind-merge)
  │   ├── dual-ai-analysis.ts  — Utilitaires analyse IA
  │   ├── puter-ai.ts          — Intégration Puter.js AI
  │   └── applicationText.ts   — Formatage texte pour candidatures
  ├── hooks/
  │   ├── useSocket.ts         — Hook React wrapant connexion socket
  │   └── use-mobile.tsx       — Détection mobile
  ├── pages/
  │   ├── LoginPage.tsx        — Login email/mot de passe, validation rôle
  │   ├── admin/
  │   │   ├── OverviewPage.tsx      — KPIs globaux, graphiques, updates socket temps réel
  │   │   ├── HRAccountsPage.tsx    — CRUD comptes RH (créer/éditer/reset/désactiver)
  │   │   ├── TemplatesPage.tsx     — CRUD templates offres (protection core templates)
  │   │   └── SettingsPage.tsx      — Édition profile, changement mot de passe, broadcast RH
  │   └── hr/
  │       ├── DashboardPage.tsx     — KPIs par site, candidatures récentes, entretiens à venir
  │       ├── OffersPage.tsx        — Grille cartes offres avec stats, sélecteur template
  │       ├── NewOfferPage.tsx      — Création offre depuis template avec formulaire complet
  │       ├── ApplicationsPage.tsx  — Wraps KanbanBoard
  │       ├── CandidatesPage.tsx    — Table virtualisée candidats avec scores IA
  │       ├── InterviewsPage.tsx    — Cartes entretiens planifiés/conclus avec modal outcome
  │       └── SettingsPage.tsx      — Affichage profile en lecture seule
  ├── components/
  │   ├── hr/                    — Composants spécifiques RH
  │   └── ui/                    — 49 composants shadcn/ui
  └── data/                      — Données mock
```

### 4.2 Configuration

| Fichier | Description |
|---------|-------------|
| `package.json` | Vite, React 18, 49 composants shadcn/ui, React Query, Zustand, Socket.IO client, Recharts, Vitest |
| `vite.config.ts` | Plugin React SWC, alias `@/` vers `./src/`, port 8080 |
| `tailwind.config.ts` | Tokens couleur personnalisés (bouarada, zaghouan), police Inter, préfixes composants shadcn |
| `components.json` | shadcn/ui style default, RSC désactivé (mode SPA), baseColor slate |

### 4.3 Authentification & État

**`store/authStore.ts`** - Store Zustand:
- Login valide que le rôle est HR ou ADMIN (rejette CANDIDATE)
- Stocke token d'accès et user JSON en sessionStorage (fallback localStorage)
- Sur 401/403, efface storage et redirige vers `/login`

**`lib/axios.ts`** - Instance Axios:
- URL de base depuis `VITE_API_URL` (défaut `localhost:4000/api`)
- Intercepteurs: attache Bearer token, gère redirections 401/403

**`lib/authSession.ts`** - Abstraction storage:
- Session storage avec fallback localStorage
- Clés: `hr_accessToken`, `hr_user`
- Nettoyage clés legacy sur clear

### 4.4 Gestion Temps Réel

**`components/SocketListener.tsx`** - Écoute les événements:

| Événement | Action |
|-----------|--------|
| `application:new` | Invalide cache React Query, toast Sonner |
| `application:analysed` | Invalide cache, toast analyse IA |
| `application:manual_analysis` | Invalide cache |
| `application:analysis_failed` | Toast erreur |
| `interview:scheduled` | Invalide cache entretiens |
| `offer:closed` | Toast offre fermée |
| `offer:expiring` | Toast offre expirant bientôt |

### 4.5 Guards de Routes

**`components/RouteGuard.tsx`** - Vérifie:
- `isAuthenticated` - redirige vers `/login` si non authentifié
- `allowedRoles` - vérifie correspondance rôle utilisateur

### 4.6 Pages HR

| Page | Description |
|------|-------------|
| `LoginPage.tsx` | Login email/mot de passe, validation rôle HR/ADMIN, redirection par rôle |
| `DashboardPage.tsx` | KPIs (total candidatures, offres actives, candidatures mois, entretiens semaine), liste candidatures récentes, entretiens à venir, graphique barres statut |
| `OffersPage.tsx` | Liste offres par site avec stats candidatures, gestion statut (open/pause/close), modal TemplateSelector |
| `ApplicationsPage.tsx` | Wraps KanbanBoard |
| `CandidatesPage.tsx` | Table virtualisée (@tanstack/react-virtual) avec colonnes: nom, poste, site, contrat, score IA, étoiles, statut |
| `InterviewsPage.tsx` | Cartes entretiens planifiés/conclus avec pagination, résumé (planifiés, réussis, échoués, absent), OutcomeModal |
| `NewOfferPage.tsx` | Formulaire multi-section création offre depuis template: info basique, détails contrat, gestion compétences |
| `SettingsPage.tsx` | Affichage profile HR en lecture seule |

### 4.7 Pages Admin

| Page | Description |
|------|-------------|
| `OverviewPage.tsx` | Dashboard complet: 6 KPIs, graphique camembert par site, graphique barres statuts, table candidatures récentes, updates socket temps réel (9 types événements) |
| `HRAccountsPage.tsx` | CRUD comptes RH: créer (nom, email, mot de passe, site), éditer, reset mot de passe, soft-delete, recherche, filtre inactifs |
| `TemplatesPage.tsx` | Gestion templates avec dialogs créer/éditer, 7 core templates protégés de désactivation, gestion compétences avec tag input |
| `SettingsPage.tsx` | Gestion profile admin (nom, mot de passe), broadcast RH (tous sites ou site spécifique) |

### 4.8 Composants HR

| Composant | Description |
|-----------|-------------|
| `DashboardLayout.tsx` | Layout shell avec Sidebar + TopBar |
| `Sidebar.tsx` | Navigation fixe gauche avec items par rôle, avatar utilisateur, badge rôle/site, logout |
| `KanbanBoard.tsx` | **Composant principal:** Drag-and-drop candidatures sur 5 colonnes (new, reviewing, interview, accepted, rejected), @hello-pangea/dnd, updates optimistes, filtrage (ville, contrat, recherche), tri (date/score/nom), drag vers "interview" ouvre ScheduleInterviewModal |
| `KanbanColumn.tsx` | Container colonne kanban |
| `KanbanCard.tsx` | Carte candidat avec score IA |
| `KanbanFilters.tsx` | Barre filtres: ville, contrat, recherche, tri, compteur visible |
| `CandidateDrawer.tsx` | Panel coulissant détails: texte CV, analyse IA, matching compétences, notes/évaluations/tags RH |
| `ScheduleInterviewModal.tsx` | Modal planification: date/heure, lieu, type (sur-site/visio/téléphone), notes |
| `OutcomeModal.tsx` | Modal outcome entretien (pass/fail/no_show) |
| `TemplateSelector.tsx` | Modal sélection template offre |
| `StatCard.tsx` | Carte KPI réutilisable avec icône, label, valeur |
| `PuterAIBattle.tsx` | Composant UI analyse IA frontend |
| `TopBar.tsx` | Barre supérieure avec titre page |

### 4.9 Templates Core Protégés

Les 7 templates suivants ne peuvent pas être désactivés:
1. `planificateur-production`
2. `acheteur-strategique`
3. `chef-equipe-achats`
4. `mecanicien-industriel`
5. `operateur-machines`
6. `technicien-electronique`
7. `responsable-rh`

### 4.10 Composants UI (shadcn/ui - 49 fichiers)

accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip, use-toast

---

## 5. Candidate PWA - Application Mobile

### 5.1 Architecture Next.js App Router

```
candidate/
  ├── next.config.mjs            — Config PWA, optimisation packages, images non optimisées
  ├── app/
  │   ├── layout.tsx             — Layout racine avec BottomNav, Providers, métadonnées PWA
  │   ├── page.tsx               — Composant HomeScreen
  │   ├── globals.css            — Styles globaux
  │   ├── (auth)/                — Groupe routes auth
  │   │   ├── layout.tsx         — Layout auth split-screen (branding + formulaire)
  │   │   ├── login/page.tsx     — Formulaire login avec validation Zod
  │   │   ├── register/page.tsx  — Inscription (nom, email, téléphone tunisien, mot de passe)
  │   │   ├── forgot-password/   — Demande reset mot de passe
  │   │   └── reset-password/    — Reset mot de passe avec token
  │   ├── (main)/profile/        — Groupe routes profile
  │   ├── jobs/[jobId]/page.tsx  — Détail offre avec cartes info, compétences, bouton postuler
  │   ├── applications/page.tsx  — Liste candidatures + écran détail
  │   ├── profile/page.tsx       — Écran profile
  │   ├── notifications/page.tsx — Écran notifications
  │   └── apply/[jobId]/         — Flux candidature multi-étapes
  │       ├── page.tsx           — Écran sélection CV (default, choisir parmi sauvegardés)
  │       ├── confirm/           — Confirmation candidature
  │       ├── form/              — Candidature par formulaire
  │       └── upload/            — Candidature par upload PDF
  ├── components/
  │   ├── providers.tsx          — QueryClientProvider + SocketListener
  │   ├── SocketListener.tsx     — Gestionnaire événements temps réel
  │   ├── bottom-nav.tsx         — Navigation bottom 4 onglets
  │   ├── job-card.tsx           — Carte offre emploi avec indicateurs urgence
  │   ├── application-card.tsx   — Carte statut candidature
  │   ├── cv-selector.tsx        — Modal sélection CV
  │   ├── filter-chips.tsx       — Chips filtre browsing
  │   ├── match-score-gauge.tsx  — Jauge score IA
  │   ├── step-progress-bar.tsx  — Stepper progression candidature
  │   ├── timeline-stepper.tsx   — Timeline candidature
  │   ├── screens/               — Écrans principaux
  │   └── ui/                    — Composants shadcn/ui
  ├── hooks/
  │   ├── useSocket.ts           — Hook connexion socket + useSocketEvent
  │   ├── useOffers.ts           — Hooks React Query pour offres
  │   └── useApplications.ts     — Hooks query + mutation pour candidatures
  ├── lib/
  │   ├── axios.ts               — Axios avec intercepteur token + refresh automatique 401
  │   ├── socket.ts              — Singleton Socket.IO avec reconnexion (10 tentatives, backoff exponentiel)
  │   ├── storage.ts             — Wrapper localStorage sécurisé avec gestion quota
  │   ├── cv-storage.ts          — Stockage CV scopé (clés préfixées user, migration legacy)
  │   ├── cv-generator.ts        — Génération CV jsPDF (templates modern + classic)
  │   ├── types.ts               — Interfaces TypeScript pour tous types API
  │   ├── utils.ts               — Helper cn()
  │   ├── data.ts                — Données/constantes statiques
  │   └── queryKeys.ts           — Factory clés React Query
  └── store/
      ├── auth.ts                — Store Zustand auth avec validation rôle (CANDIDATE seul)
      └── notifications.ts       — Store Zustand notifications
```

### 5.2 Configuration

| Fichier | Description |
|---------|-------------|
| `package.json` | Next.js 15 avec Turbopack, plugin PWA, jsPDF, React 19, Tailwind v4, Zustand, React Query |
| `next.config.mjs` | Config PWA (dest: public, register: true, skipWaiting: true), optimisation packages, images non optimisées |
| `tsconfig.json` | Next.js avec modules ESNext, résolution bundler, paths `@/*`, JSX preserve |
| `postcss.config.mjs` | Config PostCSS pour Tailwind v4 |
| `components.json` | shadcn/ui style "new-york", RSC activé, baseColor neutral, icônes lucide |

### 5.3 Implémentation PWA

**`app/layout.tsx`** - Layout racine avec:
- Métadonnées PWA (manifest, icônes, apple-web-app)
- Viewport configuration mobile avec theme color `#2563eb`
- Container max-width `max-w-lg` (design mobile-first)
- BottomNav toujours visible
- Safe area padding pour appareils encoche

**`next.config.mjs`** - Configuration PWA:
- Utilise @ducanh2912/next-pwa avec service worker
- Désactivé en développement, auto-enregistrement en production
- Manifest à `/manifest.json` avec icônes (`/icon.svg`, `/apple-touch-icon.svg`)

### 5.4 Authentification & État

**`store/auth.ts`** - Store Zustand:
- Validation rôle strict CANDIDATE uniquement (rejette HR/ADMIN)
- Auto-refresh: sur 401, appelle `/auth/refresh`, réessaie requête originale
- Sur échec refresh, efface tokens et redirige vers `/login`
- Sur 403, efface immédiatement et redirige

**`lib/axios.ts`** - Instance Axios:
- Intercepteur attache token, gère refresh automatique sur 401
- Utilise endpoint `/auth/refresh`
- Efface tokens et redirige sur échec refresh ou 403

### 5.5 Gestion Temps Réel

**`components/SocketListener.tsx`** - Gère 7 types événements:

| Événement | Action |
|-----------|--------|
| `status:changed` | Invalide cache candidatures, toast français changement statut |
| `interview:scheduled` | Invalide cache entretiens, toast planification |
| `offer:new` | Invalide cache offres, toast nouvelle offre |
| `offer:closed` | Invalide cache offres, toast offre fermée |
| `interview:reminder` | Toast rappel entretien |
| `ai:analysis_complete` | Toast analyse IA terminée |
| `ai:analysis_updated` | Invalide cache, fetch notifications mises à jour |

### 5.6 Hooks Personnalisés

| Hook | Description |
|------|-------------|
| `useSocket()` | Connecte/déconnecte socket selon état auth, persiste connexion entre unmounts |
| `useSocketEvent(event, callback)` | Attache/détache écouteurs événements socket avec ref callback fraîche |
| `useOffers()` | React Query: `useOffers()` (liste offres ouvertes), `useOffer(id)` (détail offre) |
| `useApplications()` | React Query: `useMyApplications()`, `useSubmitPDFApplication()`, `useSubmitFormApplication()`, `useSubmitSavedCVApplication()` |

### 5.7 Soumission Candidature

**`hooks/useApplications.ts`** - Trois mutations:

| Mutation | Endpoint | Description |
|----------|----------|-------------|
| `useSubmitPDFApplication` | Multipart form | Upload PDF avec clé idempotence (crypto.randomUUID ou timestamp) |
| `useSubmitFormApplication` | Formulaire structuré | Candidature via formulaire avec données CV |
| `useSubmitSavedCVApplication` | `/api/applications/from-cv` | Utilise CV sauvegardé avec clé idempotence |

**Clés d'Idempotence:** UUID sur toutes les submissions pour éviter doublons

### 5.8 Gestion des CV

**`lib/cv-storage.ts`** - Stockage scopé par utilisateur:
- Clés localStorage `candidate_cv:{userId}:...`
- Support migration clés legacy
- Stocke: liste CVs, dernier brouillon, brouillons par offre

**`lib/cv-generator.ts`** - Génération jsPDF avec deux templates:
- **modern:** En-tête bleu, police helvetica
- **classic:** Centré, police times roman
- Sections: expérience, formation, compétences

### 5.9 Socket Temps Réel Production

**`lib/socket.ts`** - Singleton Socket.IO production-ready:
- Reconnexion: 10 tentatives max, backoff exponentiel 2s-10s
- Polling-first avec upgrade WebSocket
- Gère erreurs auth, déconnexions serveur, fermetures transport
- 30 secondes retry après épuisement tentatives

### 5.10 Écrans (Screens)

| Écran | Description |
|-------|-------------|
| `home-screen.tsx` | Listing jobs principal avec recherche et filtre |
| `applications-screen.tsx` | Liste candidatures avec badges statut |
| `application-detail-screen.tsx` | Vue détaillée candidature avec info entretien et score IA |
| `notifications-screen.tsx` | Liste notifications avec gestion lu/non-lu |
| `profile-screen.tsx` | Gestion profile |

### 5.11 Composants UI

| Composant | Description |
|-----------|-------------|
| `bottom-nav.tsx` | Navigation bottom mobile 4 onglets: Accueil, Candidatures, Notifications (badge non-lu), Profile |
| `job-card.tsx` | Carte offre avec badge site (Bouarada=bleu, Zaghouan=teal), badge contrat, indicateur urgence, compétences requises, countdown deadline, salaire |
| `application-card.tsx` | Carte candidature avec badge ville, badge statut (couleur), date candidature |
| `cv-selector.tsx` | Modal sélection parmi CVs sauvegardés |
| `filter-chips.tsx` | Chips filtre browsing emplois |
| `match-score-gauge.tsx` | Visualisation jauge score IA |
| `step-progress-bar.tsx` | Indicateur progression multi-étapes |
| `timeline-stepper.tsx` | Stepper timeline candidature |

### 5.12 Flux de Candidature Multi-Étapes

```
apply/[jobId]/page.tsx          → Sélection méthode (CV default, choisir CV, créer profile)
         ↓
apply/[jobId]/confirm/          → Confirmation candidature
         ↓
apply/[jobId]/form/             → Formulaire structuré (si pas de CV)
         ↓
apply/[jobId]/upload/           → Upload PDF (si upload CV)
```

---

## 6. Communication Inter-Applications

### 6.1 Backend-to-Frontend (Temps Réel via Socket.IO)

**Rooms Socket.IO pour messages ciblés:**

| Room | Utilisateurs | Événements |
|------|-------------|------------|
| `user:{userId}` | Utilisateur individuel | Notifications, résultats analyse IA |
| `site:Bouarada` / `site:Zaghouan` | RH par site | Nouvelles candidatures, candidatures analysées, offres expirant |
| `hr:{userId}` | Chaque utilisateur RH | Updates templates, broadcasts |
| `admin` | Admins | Changements comptes RH, changements offres, updates overview |
| `candidate:{userId}` | Candidats individuels | Changements statut, planification entretiens |
| `offer:new`, `offer:closed` | Broadcast à tous | Nouvelles offres fermées |

### 6.2 Backend-to-Frontend (Email)

Emails HTML en français avec branding:

| Type | Déclencheur | Contenu |
|------|-------------|---------|
| Changement statut candidature | RH met à jour statut | Email branded avec nouveau statut |
| Invitation entretien | RH planifie entretien | Email avec pièce jointe .ics (calendrier) |
| Rappel entretien | Cron quotidien 8h (entretiens lendemain) | Rappel 24h avant |
| Reset mot de passe | Demande utilisateur | Lien de reset avec token |

### 6.3 Jobs Cron

| Job | Fréquence | Action |
|-----|-----------|--------|
| **Rappels entretiens** | Quotidien 8h00 | Envoie rappels pour entretiens du lendemain |
| **Fermeture offres expirées** | Horaire | Ferme automatiquement offres avec deadline passée |
| **Alertes expiration imminente** | Toutes les 5 minutes | Alerte RH sur offres expirant dans 24h |

### 6.4 Flux de Données

```
Candidat soumet candidature
         ↓
Backend crée Application + émet événement
         ↓
Socket.IO notifie RH du site concerné
         ↓
HR App met à jour Kanban en temps réel
         ↓
RH analyse candidature (notes, rating, tags)
         ↓
RH déclenche analyse IA (optionnel)
         ↓
AI Battle Engine analyse (6 modèles simultanés)
         ↓
Résultat IA stocké + notifié candidat
         ↓
RH planifie entretien (si positif)
         ↓
Email invitation envoyé au candidat (avec .ics)
         ↓
Cron rappelle entretien 24h avant
         ↓
RH enregistre outcome entretien
         ↓
Notification statut final au candidat
```

---

## 7. Patterns Low-Code Identifiés

### 7.1 Patterns d'Architecture

| Pattern | Où | Description |
|---------|-----|-------------|
| **Repository Pattern** | Backend | 7 repositories abstractant Prisma pour accès données |
| **Service Layer** | Backend | 7 services séparant logique métier des contrôleurs |
| **Event-Driven Architecture** | Backend | EventEmitter typé + Socket.IO pour communication cross-service |
| **Role-Based Access Control** | 3 apps | ADMIN, HR, CANDIDATE avec guards route niveau |
| **Site-Based Multi-Tenancy** | Backend + HR | Isolation données Bouarada vs Zaghouan |
| **Optimistic UI Updates** | HR Kanban | Drag-and-drop met à jour visuellement avant confirmation API |
| **JWT avec Rotation Refresh** | Backend + 2 frontends | Access (15min) + refresh (30j) avec rotation |
| **Soft Deletes** | Backend | User.deletedAt, JobOffer.deletedAt, OfferTemplate.deletedAt |
| **Snapshot Immuable CV** | Backend | Application.cvTextSnapshot préservé à soumission pour analyse IA cohérente |
| **Consensus Multi-IA** | Backend | AI Battle: Gemini + OpenRouter avec fallback |
| **Submissions Idempotentes** | Candidate PWA | Clés idempotence UUID |
| **Abstraction Storage** | Candidate PWA | Safe localStorage avec gestion quota |
| **Listes Virtualisées** | HR CandidatesPage | @tanstack/react-virtual pour grands datasets |

### 7.2 Patterns d'Intégration

| Pattern | Description |
|---------|-------------|
| **API RESTful** | Endpoints standardisés avec conventions nommage cohérentes |
| **Socket.IO Pub/Sub** | Rooms ciblées pour notifications granulaires |
| **Token Rotation** | Refresh tokens hashés SHA-256, tournés à chaque utilisation |
| **Validation Joi** | Schémas de validation réutilisables côté serveur |
| **Intercepteurs Axios** | Gestion automatique tokens et erreurs 401/403 |
| **React Query Caching** | Invalidation cache ciblée sur événements socket |

### 7.3 Patterns UI/UX

| Pattern | Où | Description |
|---------|-----|-------------|
| **shadcn/ui Components** | HR + Candidate | 49 composants Radix UI réutilisables |
| **Mobile-First** | Candidate PWA | Container max-w-lg, navigation bottom fixe |
| **Kanban Drag-and-Drop** | HR | @hello-pangea/dnd pour gestion candidatures visuelle |
| **Formulaires Zod** | HR + Candidate | React Hook Form + validation Zod |
| **Graphiques Recharts** | HR + Candidate | Visualisations KPIs et scores |
| **Templates Protégés** | HR Admin | 7 templates core non désactivables |
| **Drawer Détails** | HR | Panel coulissant pour détails candidats |
| **Modals Spécialisées** | HR | ScheduleInterview, Outcome, TemplateSelector |
| **Steppers Progression** | Candidate | Multi-étapes candidature et timeline |
| **Badges Statut** | Candidate | Codes couleur pour statuts candidatures |

### 7.4 Patterns de Données

| Pattern | Description |
|---------|-------------|
| **Prisma Schema as Source** | Schéma DB unique source de vérité pour types TypeScript |
| **Relations Typées** | Relations Prisma avec types générés automatiquement |
| **Transactions** | Operations CV par transactions (setDefault, create with default) |
| **JSON Fields** | formData, aiAnalysis, hrTags, payload notifications en JSON |
| **Enums** | Role, Site, ContractType, OfferStatus, InterviewOutcome, ApplicationStatus |
| **Unique Constraints** | (candidateId, offerId) - une candidature max par offre |
| **Index Implicites** | FK et champs de recherche indexés par Prisma |

---

## 8. Base de Données

### 8.1 Schéma Prisma

**8 Modèles avec relations:**

#### User
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| email | String (unique) | Email utilisateur |
| passwordHash | String | Mot de passe hashé bcrypt |
| role | Role enum | ADMIN, HR, CANDIDATE |
| name | String | Nom complet |
| phone | String | Téléphone tunisien |
| site | Site enum? | Bouarada, Zaghouan (HR uniquement) |
| isActive | Boolean | Statut activation (défaut true) |
| deletedAt | DateTime? | Soft-delete timestamp |
| resetToken | String? | Token reset mot de passe |
| resetTokenExpiry | DateTime? | Expiration token reset |
| city, experience, skills, cvUrl | String? | Champs spécifiques candidat |
| **Relations** | applications, cvs, notifications, refreshTokens, createdOffers, createdTemplates, scheduledInterviews |

#### CandidateCV
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| candidateId | String (FK User) | ID candidat |
| name | String | Nom du CV |
| type | String | uploaded/generated |
| source | String | Source création |
| cvUrl | String | URL/chemin fichier |
| formData | JSON | Données formulaire structurées |
| cvText | String | Texte extrait/généré |
| cvTemplate | String? | Template utilisé |
| size | Int? | Taille fichier |
| isDefault | Boolean | CV par défaut |

#### JobOffer
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| templateId | String (FK OfferTemplate) | Template source |
| site | Site enum | Bouarada, Zaghouan |
| title | String | Titre poste |
| contractType | ContractType enum | CDI, CDD, Stage, Alternance |
| department | String | Département |
| seats | Int | Nombre postes |
| description | String | Description |
| requiredSkills | String[] | Compétences requises |
| experienceYears | Int | Années expérience |
| salaryRange | String? | Fourchette salaire |
| showSalary | Boolean | Afficher salaire |
| status | OfferStatus enum | open, paused, closed |
| deadline | DateTime | Date limite |
| createdById | String (FK User) | Créateur |
| deletedAt | DateTime? | Soft-delete |
| **Relations** | template, createdBy, applications |

#### OfferTemplate
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| titleFr, titleEn | String | Titres FR/EN |
| contractType | ContractType enum | Type contrat |
| department | String | Département |
| description | String | Description |
| suggestedSkills | String[] | Compétences suggérées |
| isActive | Boolean | Actif |
| createdById | String (FK User) | Créateur |
| deletedAt | DateTime? | Soft-delete |
| **Relations** | createdBy, offers |

#### Application
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| candidateId | String (FK User) | Candidat |
| offerId | String (FK JobOffer) | Offre |
| candidateCVId | String (FK CandidateCV)? | CV utilisé |
| status | ApplicationStatus enum | new, reviewing, interview, accepted, rejected |
| cvUrl | String | URL CV |
| cvText | String? | Texte CV |
| cvTextSnapshot | String? | Snapshot immuable pour IA |
| formData | JSON? | Données formulaire |
| coverNote | String? | Lettre motivation |
| aiScore | Int? | Score IA (0-100) |
| aiAnalysis | JSON? | Analyse détaillée IA |
| hrNotes | String? | Notes RH |
| hrRating | Int? | Évaluation RH (1-5) |
| hrTags | String[] | Tags RH |
| **Contrainte unique** | (candidateId, offerId) | Une candidature max par offre |
| **Relations** | candidate, offer, candidateCV, interview |

#### Interview
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| applicationId | String (unique) | FK Application (1:1) |
| scheduledAt | DateTime | Date/heure entretien |
| location | String | Lieu |
| type | String | sur-site/visio/téléphone |
| notesForCandidate | String? | Notes pour candidat |
| outcome | InterviewOutcome? | pass, fail, no_show |
| reminderSent | Boolean | Rappel envoyé |
| **Relations** | application, createdBy |

#### Notification
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| userId | String (FK User) | Destinataire |
| type | String | Type notification |
| payload | JSON | Données notification |
| emailSent | Boolean | Email envoyé |
| readAt | DateTime? | Date lecture |
| **Relations** | user |

#### RefreshToken
| Champ | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Identifiant unique |
| userId | String (FK User) | Utilisateur |
| tokenHash | String (unique, SHA-256) | Hash token |
| expiresAt | DateTime | Expiration |
| **Relations** | user |

### 8.2 Enums

| Enum | Valeurs |
|------|---------|
| **Role** | ADMIN, HR, CANDIDATE |
| **Site** | Bouarada, Zaghouan |
| **ContractType** | CDI, CDD, Stage, Alternance |
| **OfferStatus** | open, paused, closed |
| **InterviewOutcome** | pass, fail, no_show |
| **ApplicationStatus** | new, reviewing, interview, accepted, rejected |

### 8.3 Relations Clés

```
User (ADMIN/HR) 1───* JobOffer
User (ADMIN/HR) 1───* OfferTemplate
User (CANDIDATE) 1───* CandidateCV
User (CANDIDATE) 1───* Application
User 1───* Notification
User 1───* RefreshToken
User 1───* Interview (créateur)

OfferTemplate 1───* JobOffer
JobOffer 1───* Application
Application 1───1 Interview
Application 1───1 CandidateCV (optionnel)
```

---

## 9. Sécurité

### 9.1 Authentification

| Mécanisme | Implémentation |
|-----------|----------------|
| **JWT Access Tokens** | Durée 15 minutes, signés avec JWT_ACCESS_SECRET |
| **Refresh Tokens** | 30 jours, bytes aléatoires, hash SHA-256, stockés DB, rotation à chaque utilisation |
| **Password Hashing** | bcrypt avec 12 rounds |
| **Cookies HTTP-Only** | Refresh tokens en cookies httpOnly pour protection CSRF |
| **Validation Rôle** | 3 niveaux: middleware, contrôleur, store frontend |

### 9.2 Autorisation

| Mécanisme | Description |
|-----------|-------------|
| **RBAC** | Role-Based Access Control: ADMIN, HR, CANDIDATE |
| **Site Scoping** | HR limité à son site (Bouarada/Zaghouan) |
| **Route Guards** | React Router guards avec allowedRoles |
| **Middleware requireRole** | Vérification rôle côté serveur |
| **Middleware requireSite** | Vérification appartenance site HR |

### 9.3 Protection Données

| Mesure | Description |
|--------|-------------|
| **Soft Deletes** | User, JobOffer, OfferTemplate avec deletedAt |
| **Path Traversal Protection** | Validation chemins fichiers uploads |
| **Rate Limiting** | Limitation IP sur endpoints auth |
| **Validation Joi** | Schémas validation serveur pour toutes entrées |
| **Téléphone Tunisien** | Validation spécifique: 8 chiffres commençant par 2/4/5/7/9 |
| **Idempotence** | Clés UUID sur submissions candidatures |

### 9.4 Sécurité Frontend

| Application | Mesures |
|-------------|---------|
| **HR/Admin** | Stockage tokens sessionStorage (fallback localStorage), redirect 401/403 |
| **Candidate PWA** | Auto-refresh token sur 401, localStorage sécurisé avec gestion quota |

---

## 10. Temps Réel & Automatisations

### 10.1 Socket.IO - Événements

#### Backend Émet

| Événement | Room | Déclencheur |
|-----------|------|-------------|
| `application:new` | `site:{site}` | Nouvelle candidature |
| `application:analysed` | `site:{site}`, `user:{userId}` | Analyse IA terminée |
| `application:manual_analysis` | `site:{site}` | Analyse manuelle RH |
| `application:analysis_failed` | `site:{site}` | Échec analyse IA |
| `status:changed` | `candidate:{userId}` | Changement statut candidature |
| `interview:scheduled` | `candidate:{userId}`, `site:{site}` | Entretien planifié |
| `interview:reminder` | `candidate:{userId}` | Rappel 24h avant |
| `offer:new` | Broadcast | Nouvelle offre publiée |
| `offer:closed` | Broadcast | Offre fermée |
| `offer:expiring` | `site:{site}` | Alerte expiration 24h |
| `ai:analysis_complete` | `candidate:{userId}` | Analyse IA terminée (candidat) |
| `ai:analysis_updated` | `candidate:{userId}` | Mise à jour analyse IA |
| `admin:overview` | `admin` | Mise à jour overview admin |

#### Frontend Écoute

| App | Événements Écoutés |
|-----|-------------------|
| **HR/Admin** | application:new, application:analysed, application:manual_analysis, application:analysis_failed, interview:scheduled, offer:closed, offer:expiring |
| **Candidate PWA** | status:changed, interview:scheduled, offer:new, offer:closed, interview:reminder, ai:analysis_complete, ai:analysis_updated |

### 10.2 Jobs Cron Détaillés

#### Job 1: Rappels Entretiens (Quotidien 8h00)
```
1. Requête: interview.findTomorrow()
2. Pour chaque entretien demain:
   - Email rappel au candidat
   - Notification in-app au candidat
   - Marque reminderSent = true
```

#### Job 2: Fermeture Offres Expirées (Horaire)
```
1. Requête: offres avec deadline < maintenant ET status = open
2. Update status = closed
3. Notification HR et Admin
```

#### Job 3: Alertes Expiration Imminente (Toutes les 5min)
```
1. Requête: offres avec deadline dans < 24h ET status = open
2. Si pas déjà alerté:
   - Notification HR du site
   - Marque comme alerté
```

### 10.3 Notifications Email

| Type | Destinataire | Contenu | Pièce Jointe |
|------|-------------|---------|--------------|
| Changement statut | Candidat | Email HTML branded avec nouveau statut (français) | Non |
| Invitation entretien | Candidat | Détails entretien (date, lieu, type, notes) | Oui (.ics) |
| Rappel entretien | Candidat | Rappel 24h avant entretien | Non |
| Reset mot de passe | Utilisateur | Lien reset avec token | Non |

---

## 11. Intelligence Artificielle

### 11.1 AI Battle Engine

**Architecture Multi-Modèle Simultané:**

```
Candidature à analyser
         ↓
Extraction texte CV + données formulaire
         ↓
Chargement prompt partagé (analysis-prompt.txt)
         ↓
┌─────────────────────────────────────────┐
│         Promise.allSettled              │
│                                         │
│  Gemini 2.5 Flash Lite ─────────────┐   │
│  Gemini 2.5 Flash ────────────────┐ │   │
│  Gemini 2.5 Pro ────────────────┐ │ │   │
│  Gemini 2.0 Flash ────────────┐ │ │ │   │
│  OpenRouter Free Auto ──────┐ │ │ │ │   │
│  Llama 4 Maverick ────────┐ │ │ │ │ │   │
│                           │ │ │ │ │ │   │
│                           ▼ ▼ ▼ ▼ ▼ ▼   │
│                    Consensus Builder     │
│                    (moyenne scores,      │
│                     majorité votes)      │
└─────────────────────────────────────────┘
         ↓
Si tous modèles échouent → Fallback Keyword Matching
         ↓
Sauvegarde aiScore + aiAnalysis (JSON)
         ↓
Notification RH + Candidat
```

### 11.2 Modèles IA

| Fournisseur | Modèles | Méthode |
|-------------|---------|---------|
| **Google Gemini** | 2.5 Flash Lite, 2.5 Flash, 2.5 Pro, 2.0 Flash | API directe @google/generative-ai |
| **OpenRouter** | Free Auto-Router, Llama 4 Maverick | API OpenRouter |

### 11.3 Consensus

| Métrique | Calcul |
|----------|--------|
| **Score** | Moyenne des scores 0-100 de tous modèles |
| **Recommandation** | Vote majoritaire (hire/no-hire) |
| **Compétences** | Union des compétences détectées |
| **Fallback** | Si tous IA échouent: matching mots-clés sur requiredSkills |

### 11.4 Prompt Partagé

**Emplacement:** `/home/dell/pfe/schulte/hr/public/shared/analysis-prompt.txt`

Lu dynamiquement par le backend, ce prompt guide l'analyse IA des candidatures.

### 11.5 CVTextExtractor

**Classe utilitaire pour extraction:**
- Extraction texte PDF via pdf-parse
- Assemblage données formulaire + texte CV
- Nettoyage et normalisation texte

### 11.6 Frontend AI

| Composant | Description |
|-----------|-------------|
| `dual-ai-analysis.ts` | Utilitaires analyse dual-IA côté frontend |
| `dual-ai-analysis.test.ts` | Tests unitaires analyse IA |
| `puter-ai.ts` | Intégration Puter.js AI |
| `PuterAIBattle.tsx` | Composant UI analyse IA |
| `MatchScoreGauge` | Visualisation jauge score IA (HR + Candidate) |

---

## 12. Déploiement & Configuration

### 12.1 Variables d'Environnement

#### Backend (.env)
```bash
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/schulte"
JWT_ACCESS_SECRET="votre_secret_access"
JWT_REFRESH_SECRET="votre_secret_refresh"
CLIENT_URL=http://localhost:3000
CANDIDATE_URL=http://localhost:3000
ADMIN_URL=http://localhost:8080
HR_URL=http://localhost:8080
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
GEMINI_API_KEY=your-gemini-key
OPENROUTER_API_KEY=your-openrouter-key
```

#### HR/Admin (.env.local ou VITE_)
```bash
VITE_API_URL=http://localhost:4000/api
```

#### Candidate PWA (.env.local ou NEXT_PUBLIC_)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 12.2 Scripts Backend

| Script | Commande |
|--------|----------|
| **dev** | `tsx watch src/server.ts` |
| **build** | `tsc` |
| **start** | `node dist/server.js` |
| **seed** | `tsx prisma/seed.ts` |
| **migrate** | `prisma migrate dev` |
| **generate** | `prisma generate` |

### 12.3 Ports par Défaut

| Application | Port Développement | Port Production |
|-------------|-------------------|-----------------|
| Backend | 5000 | 4000 |
| HR/Admin | 8080 | - |
| Candidate PWA | 3000 | - |

### 12.4 Scripts Frontend

#### HR/Admin
| Script | Commande |
|--------|----------|
| **dev** | `vite` (port 8080) |
| **build** | `vite build` |
| **preview** | `vite preview` |
| **test** | `vitest` |
| **lint** | `eslint .` |

#### Candidate PWA
| Script | Commande |
|--------|----------|
| **dev** | `next dev --turbopack` (port 3000) |
| **build** | `next build` |
| **start** | `next start` |

### 12.5 Dépendances Clés

#### Backend
- @prisma/client, express, bcryptjs, jsonwebtoken
- socket.io, nodemailer, multer, pdf-parse
- node-cron, @google/generative-ai, joi
- helmet, cors, morgan, winston

#### HR/Admin
- react, react-router-dom, @tanstack/react-query
- zustand, axios, socket.io-client
- @radix-ui/react-* (49 composants shadcn/ui)
- tailwindcss, recharts, @hello-pangea/dnd
- react-hook-form, @hookform/resolvers, zod
- vitest, @testing-library/react

#### Candidate PWA
- next, react, @ducanh2912/next-pwa
- zustand, @tanstack/react-query, axios
- socket.io-client, jspdf
- @radix-ui/react-* (shadcn/ui new-york)
- tailwindcss (v4), recharts
- @vercel/analytics

### 12.6 Base de Données

| Technologie | Version | Usage |
|-------------|---------|-------|
| **PostgreSQL** | 14+ | Base de données principale |
| **Prisma** | 6.x | ORM avec migrations |
| **Migrations** | Prisma Migrate | Gestion schéma versionné |
| **Seed** | `prisma/seed.ts` | Données initiales |

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **RBAC** | Role-Based Access Control |
| **PWA** | Progressive Web App |
| **ORM** | Object-Relational Mapping |
| **SPA** | Single Page Application |
| **JWT** | JSON Web Token |
| **KPI** | Key Performance Indicator |
| **CDI** | Contrat à Durée Indéterminée |
| **CDD** | Contrat à Durée Déterminée |
| **ICS** | iCalendar Standard (.ics files) |

### B. Conventions de Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| **Endpoints API** | kebab-case pluriel | `/api/job-offers` |
| **Fichiers TypeScript** | kebab-case | `auth.controller.ts` |
| **Composants React** | PascalCase | `KanbanBoard.tsx` |
| **Variables/Fonctions** | camelCase | `handleSubmit` |
| **Constantes** | UPPER_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| **Clés Storage** | snake_case préfixé | `hr_accessToken`, `candidate_cv:...` |

### C. Codes Couleur Statuts

#### Candidatures
| Statut | Couleur | Hex |
|--------|---------|-----|
| new | Bleu | #3b82f6 |
| reviewing | Jaune | #eab308 |
| interview | Violet | #8b5cf6 |
| accepted | Vert | #22c55e |
| rejected | Rouge | #ef4444 |

#### Sites
| Site | Couleur | Hex |
|------|---------|-----|
| Bouarada | Bleu | #2563eb |
| Zaghouan | Teal | #0d9488 |

### D. Checklist Déploiement

- [ ] Backend: `npm run migrate` - Appliquer migrations DB
- [ ] Backend: `npm run seed` - Seeder données initiales
- [ ] Backend: `npm run build && npm start` - Build et démarrer
- [ ] HR/Admin: `npm run build` - Build production
- [ ] Candidate PWA: `npm run build && npm start` - Build et démarrer
- [ ] Vérifier variables d'environnement toutes apps
- [ ] Tester connexion Socket.IO temps réel
- [ ] Valider emails transactionnels
- [ ] Vérifier jobs cron fonctionnent
- [ ] Tester authentification tous rôles
- [ ] Tester flux candidature complet

---

**Document généré automatiquement à partir de l'analyse du codebase**  
**Version:** 1.0  
**Dernière mise à jour:** Avril 2026
