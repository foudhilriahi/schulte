# Diagramme d'Activite — Mise a Jour Statut Kanban RH
# UX actuelle: drag-and-drop conserve + changement via drawer.

```mermaid
flowchart TD
    A[RH ouvre le board Kanban] --> B{Action RH}

    B -->|Drag and drop carte| C[onDragEnd calcule fromStatus et toStatus]
    B -->|Ouvre drawer candidat| D[Selectionne nouveau statut dans le drawer]

    C --> E{Statut change ?}
    E -->|Non| Z[Fin sans requete]
    E -->|Oui| F[Map statut UI vers backend]

    D --> G{Statut choisi valide ?}
    G -->|Non| Z
    G -->|Oui| F

    F --> H{toStatus = interview ?}

    H -->|Oui| I[Ouvre ScheduleInterviewModal et stocke pendingSchedule]
    I --> J{Modal completee ?}
    J -->|Non| K[Rollback visuel vers fromStatus]
    K --> Z
    J -->|Oui| L[POST /api/interviews puis PATCH status interview]
    L --> M[fetchApplications + toast succes]
    M --> Z

    H -->|Non| N[PATCH /api/applications/:id/status]
    N --> O[Backend normalizeStatus]
    O --> P{Valeur recue}

    P -->|review| Q[Converti en reviewing]
    P -->|new/reviewing/interview/accepted/rejected| R[Conserve tel quel]
    P -->|autre| S[Retour 400 statut invalide]

    Q --> T[Update DB + emit application.statusChanged]
    R --> T

    T --> U[Socket status:changed + notifications]
    U --> V[UI RH met a jour colonne]
    U --> W[PWA candidat met a jour timeline]
    V --> X[Toast succes]
    W --> X
    X --> Z

    S --> Y[UI affiche erreur et rollback visuel]
    Y --> Z
```
