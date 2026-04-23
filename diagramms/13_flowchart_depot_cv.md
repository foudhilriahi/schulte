# Flowchart — CV Library puis Depot de Candidature (Flow actuel)

```mermaid
flowchart TD
    A([Candidat ouvre Profil > Mes CV]) --> B{Choix de creation CV}

    B -->|Upload PDF| C[Validation client type PDF + taille <= 5 Mo]
    C --> D[POST /api/cvs/upload]
    D --> E[pdf-parse extrait cvText]
    E --> F{cvText >= 50 caracteres}
    F -->|Non| G[400 PDF vide/illisible]
    F -->|Oui| H[Save CandidateCV source=profile_upload]

    B -->|Builder (Split-Screen / Live Preview)| I[Formulaire interactif avec champs optionnels (Langues, Liens)]
    I --> J[POST /api/cvs/generated]
    J --> K[Validation backend stricte (Zod + Regex Anti-Troll)]
    K --> K2[Assemblage du CV en Markdown structuré pour l'IA]
    K2 --> L[Save CandidateCV source=profile_generated]

    H --> M[Utilisateur peut marquer un CV par defaut]
    L --> M
    M --> N[PATCH /api/cvs/:id/default]

    N --> O([Candidat clique Postuler sur offre])
    O --> P[GET /api/cvs/mine]
    P --> Q{CV selectionne ?}
    Q -->|Non| R[Utilise CV par defaut]
    Q -->|Oui| S[Utilise cvId choisi]

    R --> T[POST /api/applications/from-cv]
    S --> T

    T --> U[Verifie ownership cvId + offre open + unicite offre/candidat]
    U --> V[Cree Application + candidateCVId + cvTextSnapshot]
    V --> W[201 Created]
    V --> X[Emit application:new room RH]
    X --> Y[Kanban RH mis a jour]

    V --> Z[Analyse IA asynchrone depuis snapshot]
    Z --> AA[Save aiAnalysis/aiScore]
    AA --> AB[Emit application:analysed RH]
    AA --> AC[Emit ai:analysis_complete candidat]
```
