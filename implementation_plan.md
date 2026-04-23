# Plan d'Implémentation : Refactoring, Sécurité et Refonte Éthique

Une analyse complète des 34 points remontés a été effectuée. Voici le plan d'action structuré par domaine pour corriger ces éléments de manière systématique.

## 1. Documentation & Éthique (Guides & Diagrammes)
- **`Rapport guide.md` & `Rapport guide.md.backup_*`** : 
  - Remplacement complet de la section "Anti-Détection IA/Plagiat" par un guide académique éthique (normes de citation, outils d'aide à la correction, honnêteté intellectuelle).
  - Extraction du grand template LaTeX dans un fichier séparé pour plus de lisibilité.
- **`rapport-schulte-status.md`** : 
  - Masquage des paramètres cryptographiques explicites (cost bcrypt, secrets).
  - Mise à jour et validation des versions réelles de la stack technique (React, Tailwind, etc.).
- **`diagramms/*.md`** : 
  - **Auth (`03`)** : Ajout du flux de connexion réussi pour le candidat, détails du TTL des tokens, limitation de requêtes (`verify-email`), et flux de renvoi (`resend-verification`).
  - **Admin (`08`)** : Séparation des endpoints `deactivate` / `reactivate`.
  - **Sécurité (`17`)** : Ajout du flux CSRF, clarification de la révocation immédiate globale, et ajustement du Rate Limiter (5-10 req).
  - **RGPD (`18`)** : Ajout d'une étape de saisie de mot de passe avant suppression, gestion de la destruction du cookie avant suppression DB, et redirection vers une page de confirmation claire.
  - **Architecture (`12`) & Classes (`02`)** : Correction orthographique française et ajout des méthodes `delete`/`permanentDelete` pour les templates.

## 2. Backend (Node/Express/Prisma)
- **`admin.controller.ts`** : Enveloppement de la réassignation des objets et de la suppression d'un compte RH au sein d'une seule transaction atomique (`prisma.$transaction`).
- **`auth.controller.ts`** : 
  - Remplacement de `Math.random()` par `crypto.randomInt()` pour la génération sécurisée des codes à 6 chiffres.
  - Correction de la fuite d'information sur la route `resend-verification` (retour d'un HTTP 200 générique au lieu d'un 429).
  - Sécurisation du jeton d'auto-login (vérification de `user.isActive` et injection du `site`).
- **`profile.controller.ts`** : Exigence de re-saisie du mot de passe dans `DELETE /api/profile` avant exécution de la suppression.
- **`candidate-cv.controller.ts`** : Ajout de gardes (`typeof item === 'object' && item !== null`) sur les boucles de validation `languages`, `links`, et `experience` pour prévenir les crashs d'API.
- **`middleware/authenticate.ts`** : Enveloppement du callback asynchrone de `jwt.verify` dans un bloc `try/catch` pour gérer les rejets de promesses (Unhandled Promise Rejection).

## 3. Frontend & PWA (Bugs, UI, et PWA Workers)
- **Authentification PWA** : 
  - Validation stricte de `userId` et `email` avant redirection post-inscription/connexion (`login` & `register`).
  - Utilisation de `useRef` pour nettoyer proprement les `setTimeout` dans `verify-email` (fuites de mémoire).
- **Profil & CV PWA** :
  - `cv-preview.tsx` : Fallback par défaut `data ?? {}` et rendu des liens web en balises `<a>` (`_blank`, `noopener`).
  - `application-detail-screen.tsx` : Correction du mot "envoyée" et ajout d'un fallback si `appliedAt` est invalide.
  - `profile-screen.tsx` : Séparation du `logout()` et du `api.delete()` en deux blocs try/catch pour garantir le message de succès RGPD.
- **Service Workers PWA** : 
  - Ajout de vérifications défensives (`typeof self.fallback`) dans `sw.js` et vérification de `n` dans `fallback-*.js`.
  - Changement de `CacheFirst` vers `NetworkFirst` ou `StaleWhileRevalidate` pour les uploads locaux.
  - Suppression de `"orientation": "portrait"` du `manifest.json`.
  - Ajout du bundle minifié `workbox-*.js` au `.gitignore` et suppression du repo.
- **Tableau de Bord RH** : 
  - Refonte du fichier `analysis-prompt.txt` : ajout d'un schéma JSON strict, consignes anti-discrimination, ajustement des mots par langue, suppression du persona "Rania Mansour", et ajout de métadonnées d'audit (PII/Version).
  - Validation stricte `http/https` pour le rendu des liens dans le `CandidateDrawer`.
  - Ajout d'états de chargement (`isDeletingPermanent`) pour empêcher le double-clic lors des suppressions définitives dans les pages Admin.
  - Assignation de `htmlFor` et `id` corrects dans `OverviewPage`.
  - Restriction de la configuration `allowedHosts: true` dans `vite.config.ts`.

## 4. Scripts d'Infrastructure (.sh)
- **`tunnel-share.sh` & `tunnel-stop.sh`** : 
  - Remplacement du `sed -i` non-portable par l'écriture dans un fichier temporaire (compatible macOS/Linux).
  - Remplacement de `grep -P` par `grep -oE`.
  - Vérification de l'existence des fichiers avant d'exécuter `cp`, `rm` ou d'afficher `echo "... removed"`.
  - Masquage (ou demande en ligne de commande) des mots de passe codés en dur dans les `echo`.

---

> [!IMPORTANT]  
> Compte tenu de l'ampleur des modifications couvrant toute la stack (du script sh jusqu'à la PWA), validez-vous ce plan exhaustif pour que je commence le refactoring fichier par fichier ?
