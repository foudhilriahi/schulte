# Diagramme de Sequence — Authentification des 3 Roles
# Tous les roles se connectent par email + mot de passe.

```mermaid
sequenceDiagram
    actor Admin as Admin
    actor RH as RH
    actor Candidat as Candidat PWA
    participant Frontend as Frontend Web (React Vite / Next.js)
    participant Backend as Express API
    participant DB as PostgreSQL
    participant Cookie as Cookie httpOnly

    Note over Admin, RH: Connexion Admin et RH

    Admin->>Frontend: Saisit email + mot de passe
    Frontend->>Backend: POST /api/auth/login avec email et password
    Backend->>Backend: Login limiter rateLimiter 100 req / minute / IP
    alt Trop de tentatives
        Backend-->>Frontend: 429 Trop de tentatives
    else OK
        Backend->>DB: Cherche utilisateur par email
        Backend->>Backend: bcrypt.compare password avec hash
        alt Mot de passe incorrect
            Backend-->>Frontend: 401 Identifiants invalides
        else Authentification reussie
            Backend->>Backend: Genere JWT 15min + refreshToken aleatoire
            Backend->>DB: Sauvegarde SHA-256 du refreshToken
            Backend->>Cookie: setRefreshCookie httpOnly 30 jours
            Backend-->>Frontend: 200 avec accessToken et user
            Frontend->>Frontend: Stocke token et profil (store front)
            Frontend-->>Admin: Redirection dashboard
        end
    end

    RH->>Frontend: Saisit email + mot de passe
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Verifie credentials + compte actif
    alt Compte RH inactif
        Backend-->>Frontend: 403 Account inactive
        Frontend-->>RH: Message contacter administrateur
    else Connexion RH valide
        Backend-->>Frontend: 200 accessToken + refresh cookie
        Frontend-->>RH: Redirection dashboard RH
    end

    Note over Candidat, Cookie: Inscription candidat et Verification Email

    Candidat->>Frontend: Saisit nom + email + telephone + mot de passe
    Frontend->>Frontend: Validation formulaire (email, telephone, password)
    alt Donnees invalides
        Frontend-->>Candidat: Erreurs de validation
    else Numero valide
        Frontend->>Backend: POST /api/auth/register
        Backend->>DB: Verifie unicite email et telephone
        alt Email/telephone deja utilise
            Backend-->>Frontend: 409 Conflit compte existant
        else Nouveau candidat
            Backend->>Backend: hash password, genere verifyTokenHash (6 chiffres, exp 1h)
            Backend->>DB: Cree utilisateur (role CANDIDATE, emailVerified: false)
            Backend->>EmailService: Envoie email avec le code a 6 chiffres
            Backend-->>Frontend: 201 Created (sans token)
            Frontend-->>Candidat: Redirection vers /verify-email
        end
    end

    Note over Candidat, Backend: Verification Email

    Candidat->>Frontend: Saisit code a 6 chiffres
    Frontend->>Backend: POST /api/auth/verify-email
    Backend->>Backend: Rate Limit (5 req / 15 min)
    alt Rate Limit depasse
        Backend-->>Frontend: 429 Trop de tentatives
    else OK
        Backend->>DB: Cherche token valide et non expire
        alt Token invalide ou expire
            Backend-->>Frontend: 400 Invalid or expired code
        else Token valide
        Backend->>DB: Met a jour emailVerified = true, efface token
        Backend->>Backend: Genere JWT 15min + refreshToken aleatoire
        Backend->>Cookie: setRefreshCookie httpOnly 30 jours
        Backend-->>Frontend: 200 avec accessToken et user
        Frontend-->>Candidat: Redirection vers espace candidat
    end

    Note over Candidat, Backend: Tentative de Connexion (Non verifie)

    Candidat->>Frontend: Saisit email + mot de passe
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Cherche utilisateur par email
    alt emailVerified == false
        Backend-->>Frontend: 403 EMAIL_NOT_VERIFIED
        Frontend-->>Candidat: Redirection vers /verify-email
    else Authentification reussie
        Backend->>Backend: Genere JWT 15min + refreshToken
        Backend->>Cookie: setRefreshCookie httpOnly 30 jours
        Backend-->>Frontend: 200 avec accessToken et user
        Frontend-->>Candidat: Redirection espace candidat
    end

    Note over Candidat, Backend: Renvoyer code de verification

    Candidat->>Frontend: Clique "Renvoyer le code"
    Frontend->>Backend: POST /api/auth/resend-verification
    Backend->>Backend: Verifie si utilisateur existe (silencieux)
    Backend->>Backend: Limiteur 3 req / heure
    alt Rate Limit depasse
        Backend-->>Frontend: 200 OK (Dissimulation du status 429)
    else OK
        Backend->>Backend: Genere nouveau verifyTokenHash (exp 1h)
        Backend->>DB: Met a jour l'utilisateur
        Backend->>EmailService: Renvoie email
        Backend-->>Frontend: 200 OK
    end

    Note over Frontend, Cookie: Rotation du refresh token

    Frontend->>Backend: Requete avec token expire
    Backend-->>Frontend: 401 Unauthorized
    Frontend->>Backend: POST /api/auth/refresh (cookie httpOnly)
    alt Refresh valide
        Backend->>DB: Verifie hash token + expiration
        Backend->>DB: Rotation (delete ancien + create nouveau)
        Backend-->>Frontend: 200 nouveau accessToken
        Frontend->>Frontend: Rejoue la requete initiale
    else Refresh invalide/expire
        Backend-->>Frontend: 401 No refresh token / expired
        Frontend->>Frontend: clear session locale
        Frontend-->>Admin: Redirection login
    end

    Note over RH, Admin: Politique reset mot de passe RH
    RH-->>RH: Pas d'ecran self-service mot de passe dans le dashboard RH
    RH->>Admin: Demande reset mot de passe
    Admin->>Backend: PATCH /api/admin/hr-accounts/:id avec nouveau password
    Backend->>DB: Update passwordHash
    Backend-->>Admin: 200 Password reset
    Note over RH, Backend: Endpoint /api/profile/password existe cote API pour utilisateur authentifie
```
