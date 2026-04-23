# 18. Conformité RGPD & Droit à l'Oubli

Ce diagramme illustre le flux de suppression d'un compte (Droit à l'oubli / RGPD). Il montre comment l'application garantit une suppression définitive et complète des données personnelles (CV, candidatures, sessions) d'un candidat grâce au système de "Cascade Delete" du moteur Prisma (ORM).

```mermaid
sequenceDiagram
    autonumber
    actor C as Candidat (PWA)
    participant F as Frontend (React)
    participant A as API Profile (Backend)
    participant DB as Prisma / Base de données

    Note over C, F: Demande de suppression définitive
    C->>F: Clique sur "Zone de Danger > Supprimer mon compte"
    F->>C: Affiche la modale de confirmation
    C->>F: Confirme l'action (irréversible)
    
    F->>A: DELETE /api/profile
    A->>A: Vérification JWT (Authentification)
    A->>DB: Recherche de l'utilisateur (findById)
    
    alt Utilisateur non trouvé
        A-->>F: 404 User Not Found
    else Utilisateur trouvé
        A->>DB: Suppression Utilisateur (DELETE FROM Users)
        
        Note over A, DB: Effet Cascade (Prisma onDelete: Cascade)
        DB-->>DB: Suppression auto des Refresh Tokens
        DB-->>DB: Suppression auto des CandidateCV associés
        DB-->>DB: Suppression auto des Applications (Candidatures)
        DB-->>DB: Suppression auto des Notifications
        
        DB-->>A: Suppression confirmée
        
        A->>A: Destruction du Cookie de Refresh (HttpOnly)
        A-->>F: 200 OK (Account Deleted)
        
        F->>F: Suppression du state (Zustand Auth Store)
        F->>C: Redirection vers /register avec message de confirmation
    end
```
