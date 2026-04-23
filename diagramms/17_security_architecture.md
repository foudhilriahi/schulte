# 17. Architecture de Sécurité (Protection et Accès)

Ce diagramme illustre les mesures de protection mises en place sur l'ensemble de la plateforme (PWA, RH, Admin) : authentification via JWT, protection CSRF/XSS, Rate Limiting, validation Zod, et révocation immédiate.

```mermaid
sequenceDiagram
    autonumber
    actor C as Client (PWA/Dashboard)
    participant M as Middleware (Rate Limiter, Zod)
    participant A as Auth & Guard (authenticate.ts)
    participant B as Backend / Services
    participant DB as Base de Données

    Note over C, DB: Protection contre les attaques DDoS et Injections
    C->>M: Requête (ex: POST /api/auth/login)
    M->>M: Rate Limiter (ex: 100 req / 15 mins)
    M->>M: Validation Zod (Filtrage des inputs, Regex stricte)
    
    alt Limite dépassée ou Input invalide
        M-->>C: 429 Too Many Requests / 400 Bad Request
    end
    
    M->>B: Requête autorisée et nettoyée

    Note over C, DB: Cycle de vie du Token & Sécurité XSS
    B->>DB: Validation des identifiants
    B->>B: Génération JWT (Access Token 15 mins)
    B->>B: Génération Refresh Token (Aléatoire)
    B->>DB: Sauvegarde du Refresh Token Hashé
    B-->>C: 200 OK + JWT (Bearer) + Cookie HttpOnly (Refresh)
    
    Note right of C: Le cookie HttpOnly empêche le vol<br/>de session par JavaScript (Faille XSS).

    Note over C, DB: Authentification et Révocation Immédiate
    C->>A: Requête Sécurisée + Header Bearer JWT
    A->>A: jwt.verify() (Vérification signature & expiration)
    
    alt Token Invalide
        A-->>C: 401 Unauthorized
    else Rôle HR ou ADMIN détecté
        A->>DB: check isActive (Révocation Immédiate)
        alt isActive == false
            A-->>C: 403 Account Deactivated
        end
    end
    
    A->>B: Exécution du contrôleur (Authorized)

    Note over C, DB: Sécurité Temps Réel (WebSockets)
    C->>B: Connexion Socket.io
    B->>A: Validation du Token JWT dans le Handshake
    B->>B: Restriction de Room (ex: 'candidate:id' ou 'hr:site')
```
