# 📐 Diagrammes Mermaid — Schulte Tunisia Recruitment Platform
## Index des Diagrammes pour le Rapport PFE

Tous les diagrammes sont en **français**, au format Mermaid.js (.md).  
Ils peuvent être intégrés directement dans le rapport PFE via tout éditeur Markdown supportant Mermaid (Typora, Obsidian, VS Code + extension Markdown Preview Mermaid, GitLab, GitHub).

---

## 📊 Diagramme Entité-Relation (ERD)

| Fichier | Description |
|---|---|
| [01_erd.md](./01_erd.md) | Schéma complet de la base de données PostgreSQL — toutes les tables, colonnes, types et relations |

---

## 🏗️ Diagramme de Classes

| Fichier | Description |
|---|---|
| [02_class_diagram.md](./02_class_diagram.md) | Architecture logicielle complète : entités Prisma, énumérations, repositories (Pattern Repository), services (Strategy, Observer, Factory) |

---

## 🔄 Diagrammes de Séquence

| Fichier | Description |
|---|---|
| [03_sequence_auth.md](./03_sequence_auth.md) | Authentification des 3 rôles (email + mot de passe), refresh token httpOnly et politique de reset mot de passe |
| [04_sequence_candidature.md](./04_sequence_candidature.md) | Dépôt de candidature actuel : sélection CV bibliothèque, CV par défaut, endpoint `/applications/from-cv`, snapshot immutable et analyse async |
| [05_sequence_ia.md](./05_sequence_ia.md) | Pipeline IA dual provider : Puter.js + backend Gemini avec prompt partagé, merge conservateur et persistance |
| [06_sequence_temps_reel.md](./06_sequence_temps_reel.md) | Flux temps réel Socket.io : status, analyse terminée, entretien synchronisé côté candidat et room site RH |
| [07_sequence_entretien.md](./07_sequence_entretien.md) | Planification d'entretien + rappel J-1 cron + enregistrement d'outcome (pass/fail/no_show), avec statut candidature géré séparément |
| [08_sequence_admin.md](./08_sequence_admin.md) | Administration — CRUD comptes RH + gestion templates + propagation Socket.io `template:updated` |
| [15_sequence_reset_password_hr.md](./15_sequence_reset_password_hr.md) | Reset mot de passe RH géré par Admin : modal Admin -> PATCH compte RH (mise à jour hash) |
| [16_activity_kanban_status_update.md](./16_activity_kanban_status_update.md) | Activité Kanban RH : drag-and-drop + changement via drawer, branche interview (modal) et mapping `review` -> `reviewing` |

---

## 🔀 Diagrammes d'États

| Fichier | Description |
|---|---|
| [09_state_candidature.md](./09_state_candidature.md) | Cycle de vie complet d'une candidature : new → reviewing → interview → accepted / rejected |
| [10_state_offre.md](./10_state_offre.md) | Cycle de vie d'une offre d'emploi : open → paused → closed + Socket.io `offer:new` / `offer:closed` |

---

## ✅ Diagramme des Exigences

| Fichier | Description |
|---|---|
| [11_requirement_diagram.md](./11_requirement_diagram.md) | Exigences fonctionnelles (candidat, RH, admin) et non-fonctionnelles (sécurité OWASP, temps réel, coût zéro, multilangue) |

---

## 🏛️ Architecture & Flowcharts

| Fichier | Description |
|---|---|
| [12_architecture.md](./12_architecture.md) | Vue globale : Admin/RH React Vite + PWA candidat Next.js, backend Express, PostgreSQL, Socket.io, services externes (Puter.js, Gemini, Gmail) |
| [13_flowchart_depot_cv.md](./13_flowchart_depot_cv.md) | Flowchart actuel CV library -> CV par défaut/choix -> candidature from-cv -> snapshot -> analyse async |

---

## 📅 Planning

| Fichier | Description |
|---|---|
| [14_gantt_roadmap.md](./14_gantt_roadmap.md) | Diagramme de Gantt sur 4 mois — toutes les tâches de développement jusqu'à la soutenance |

---

## 🛠️ Intégration dans le Rapport

### Option 1 — Typora / Obsidian
Ouvrez les fichiers `.md` directement. Le rendu Mermaid est automatique.

### Option 2 — VS Code
Installez l'extension **"Markdown Preview Mermaid Support"** puis prévisualisez avec `Ctrl+Shift+V`.

### Option 3 — Mermaid Live Editor
Copiez le contenu du bloc ` ```mermaid ``` ` sur [mermaid.live](https://mermaid.live) pour exporter en PNG/SVG.

### Option 4 — LaTeX / Word
1. Ouvrez le diagramme sur [mermaid.live](https://mermaid.live)
2. Exportez en **SVG** ou **PNG** haute résolution
3. Insérez l'image dans votre rapport

---

## 📋 Récapitulatif des Patterns Illustrés

| Pattern | Diagramme(s) |
|---|---|
| **Repository** | Diagramme de Classes (02) |
| **Strategy (IA)** | Diagramme de Classes (02) + Séquence IA (05) |
| **Observer (Notifications)** | Séquence Temps Réel (06) + Séquence Entretien (07) |
| **Factory (CV)** | Diagramme de Classes (02) + Séquence Candidature (04) |
| **MVC** | Architecture (12) |
| **RBAC + Site Ownership** | Séquence Auth (03) + Séquence Admin (08) |
| **Pub/Sub Rooms Socket.io** | Séquence Temps Réel (06) + Architecture (12) |
