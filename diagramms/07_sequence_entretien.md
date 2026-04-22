# Diagramme de Sequence — Planification Entretien et Decision Finale

```mermaid
sequenceDiagram
    actor RH as RH Dashboard
    participant Drawer as CandidateDrawer
    participant Modal as ScheduleModal
    participant API as Express API
    participant DB as PostgreSQL
    participant Emitter as EventEmitter
    participant Socket as Socket.io
    participant Email as Nodemailer
    participant Cron as node-cron
    participant PWA as Candidat PWA
    participant HRSite as Room site RH

    RH->>Drawer: Clique Planifier un entretien
    Drawer->>Modal: Ouvre ScheduleModal

    RH->>Modal: Selectionne date heure lieu et notes
    RH->>Modal: Clique Confirmer

    Modal->>API: POST /api/interviews avec applicationId scheduledAt location notes
    API->>API: Validation format scheduledAt (date parseable)

    alt Format invalide
        API-->>Modal: 400 Format de date invalide
        Modal-->>RH: Erreur sous le champ date
    else Format valide
        API->>DB: interview upsert (create ou update) par applicationId
        API->>DB: update application.status = interview
        Note over API, Emitter: Ce endpoint n'emet pas application.statusChanged
        API->>Emitter: emit interview.scheduled

        par Notifications entretien
            Emitter->>Socket: emit interview:scheduled vers candidate
            Socket-->>PWA: Carte entretien avec date lieu notes
        and
            Emitter->>Socket: emit interview:scheduled vers room site RH
            Socket-->>HRSite: Synchronisation planning cote RH
        and
            Emitter->>Email: sendInterviewScheduled avec fichier ics
            Email-->>PWA: Email avec calendrier ics si email disponible
        end

        API-->>Modal: 201 Cree
        Modal-->>RH: Ferme et toast confirme
    end

    Note over Cron, PWA: Rappel automatique la veille via node-cron

    Cron->>DB: findUpcomingUnreminded
    DB-->>Cron: Entretiens demain
    Cron->>Socket: emit interview:reminder vers candidate
    Socket-->>PWA: Banniere Rappel entretien demain
    Cron->>Email: sendReminder si email disponible
    Cron->>DB: markReminderSent

    Note over RH, PWA: Jour J le RH peut enregistrer un resultat entretien

    RH->>Drawer: Ouvre OutcomeModal et choisit le resultat

    alt Resultat Pass
        Drawer->>API: PATCH /api/interviews/:id/outcome avec pass
        API->>DB: interviewRepo.markOutcome(pass)
        API-->>Drawer: 200 Outcome enregistre

    else Resultat Fail
        Drawer->>API: PATCH /api/interviews/:id/outcome avec fail
        API->>DB: interviewRepo.markOutcome(fail)
        API-->>Drawer: 200 Outcome enregistre

    else No Show
        Drawer->>API: PATCH /api/interviews/:id/outcome avec no_show
        API->>DB: interviewRepo.markOutcome(no_show)
        API-->>Drawer: 200 Outcome enregistre
    end

    Note over RH, API: Le passage en accepted/rejected se fait via PATCH /api/applications/:id/status
    Note over RH, PWA: Le candidat recoit status:changed seulement quand ce statut candidature est modifie
```
