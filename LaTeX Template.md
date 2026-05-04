## TEMPLATE LATEX COMPLET POUR OVERLEAF

Copie ce template entier dans un nouveau projet Overleaf.
Remplace les [PLACEHOLDER] avec ton contenu.

```latex
\documentclass[12pt,a4paper]{report}

% ── Encodage et langue ──────────────────────────────────────────
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[french]{babel}
\usepackage{csquotes}

% ── Mise en page ────────────────────────────────────────────────
\usepackage[top=2.5cm, bottom=2.5cm, left=3cm, right=2.5cm]{geometry}
\usepackage{setspace}
\onehalfspacing

% ── Typographie ─────────────────────────────────────────────────
\usepackage{lmodern}
\usepackage{microtype}

% ── Couleurs et graphiques ──────────────────────────────────────
\usepackage{xcolor}
\usepackage{graphicx}
\usepackage{float}
\usepackage{tikz}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}

% ── Tableaux ────────────────────────────────────────────────────
\usepackage{booktabs}
\usepackage{tabularx}
\usepackage{longtable}
\usepackage{multirow}
\usepackage{array}

% ── Code source ─────────────────────────────────────────────────
\usepackage{listings}
\usepackage{minted}   % necessite --shell-escape dans Overleaf
\definecolor{codebg}{rgb}{0.95,0.95,0.95}
\lstset{
  backgroundcolor=\color{codebg},
  basicstyle=\ttfamily\small,
  breaklines=true,
  frame=single,
  numbers=left,
  numberstyle=\tiny\color{gray},
  keywordstyle=\color{blue},
  commentstyle=\color{gray},
  stringstyle=\color{red},
}

% ── Liens et PDF ────────────────────────────────────────────────
\usepackage[hidelinks,
  pdfauthor={[TON NOM]},
  pdftitle={Rapport PFE — Schulte Tunisia},
  pdfsubject={Plateforme de Recrutement Intelligente}
]{hyperref}

% ── En-têtes et pieds de page ───────────────────────────────────
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small\leftmark}
\fancyhead[R]{\small Schulte Tunisia}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0.4pt}

% ── Acronymes et glossaire ──────────────────────────────────────
\usepackage[acronym]{glossaries}
\makeglossaries

% ── Bibliographie ───────────────────────────────────────────────
\usepackage[backend=biber, style=ieee]{biblatex}
\addbibresource{references.bib}

% ── Couleurs Schulte ────────────────────────────────────────────
\definecolor{schulteblue}{HTML}{1A2B4A}
\definecolor{schulteviolet}{HTML}{5B4FE8}
\definecolor{schulteamber}{HTML}{C8873A}

% ── Titre personnalise pour les chapitres ───────────────────────
\usepackage{titlesec}
\titleformat{\chapter}[display]
  {\normalfont\huge\bfseries\color{schulteblue}}
  {Chapitre \thechapter}{20pt}{\Huge}

%% ─────────────────────────────────────────────────────────────
\begin{document}

% ── PAGE DE GARDE ────────────────────────────────────────────────
\begin{titlepage}
\centering
\vspace*{1cm}

{\large \textbf{[NOM DE TON UNIVERSITE / ECOLE]}}\\[0.3cm]
{\large [Departement / Filiere]}\\[0.5cm]
\rule{\linewidth}{0.5pt}\\[0.5cm]

{\Large \textbf{Rapport de Projet de Fin d'Etudes}}\\[0.3cm]
{\large Pour l'obtention du diplome de [Licence / Master / Ingenieur]}\\[1.5cm]

{\color{schulteblue}\rule{\linewidth}{2pt}}\\[0.5cm]
{\Huge \textbf{Plateforme Intelligente de Recrutement}}\\[0.3cm]
{\LARGE Schulte Automotive Tunisia}\\[0.3cm]
{\large Application Web Full-Stack avec IA, Temps Reel et PWA Mobile}\\[0.5cm]
{\color{schulteblue}\rule{\linewidth}{2pt}}\\[1.5cm]

\begin{minipage}[t]{0.45\textwidth}
\textbf{Realise par :}\\
[TON NOM COMPLET]
\end{minipage}
\hfill
\begin{minipage}[t]{0.45\textwidth}
\raggedleft
\textbf{Encadrant academique :}\\
[NOM DU SUPERVISEUR]\\[0.5cm]
\textbf{Encadrant en entreprise :}\\
[NOM SI APPLICABLE]
\end{minipage}

\vfill

\textbf{Organisme d'accueil :} Schulte Automotive Tunisia Sarl\\
Bouarada, Siliana \& Zaghouan, Tunisie\\[0.5cm]
{\large Annee universitaire : 2024 -- 2025}
\end{titlepage}

% ── RESUME ───────────────────────────────────────────────────────
\chapter*{Resume}
\addcontentsline{toc}{chapter}{Resume}

Ce projet de fin d'etudes porte sur la conception et le developpement d'une
plateforme de recrutement intelligente destinee a Schulte Automotive Tunisia,
filiale tunisienne du groupe allemand Schulte \& Co. GmbH, specialisee dans
la fabrication de composants electriques pour l'industrie automobile.

Face a l'absence de tout systeme de recrutement local -- les candidats tunisiens
etant rediriges vers un formulaire en langue allemande referençant des institutions
inexistantes en Tunisie -- nous avons conçu une solution full-stack composee de
trois applications interdependantes : un tableau de bord RH, une interface
d'administration, et une application mobile progressive (PWA) destinee aux candidats.

La solution integre un systeme de Kanban drag-and-drop en temps reel via Socket.io,
une pipeline d'analyse IA double-fournisseur (GPT-4o via Puter.js et Google Gemini
2.5 Flash), ainsi qu'un generateur de CV client-side en JavaScript.

\textbf{Mots-cles :} Recrutement, Next.js, Node.js, PostgreSQL, Socket.io,
Intelligence Artificielle, PWA, ATS, Temps Reel

\newpage

% ── TABLE DES MATIERES ───────────────────────────────────────────
\tableofcontents
\newpage
\listoffigures
\newpage
\listoftables
\newpage

% ════════════════════════════════════════════════════════════════
%  INTRODUCTION GENERALE
% ════════════════════════════════════════════════════════════════
\chapter*{Introduction Generale}
\addcontentsline{toc}{chapter}{Introduction Generale}
\markboth{Introduction Generale}{}

\section*{Cadre du stage}
Ce projet de fin d'etudes a ete realise au sein de Schulte Automotive Tunisia Sarl,
entreprise specialisee dans la fabrication de cables et de faisceaux electriques
pour l'industrie automobile, certifiee IATF 16949. L'entreprise opere sur deux
sites de production, a Bouarada (gouvernorat de Siliana) et a Zaghouan, et emploie
plus de 300 collaborateurs. Dans ce contexte industriel, le recrutement constitue
un levier critique pour maintenir la continuite de production et la qualite des
operations.

\section*{Problematique}
Au debut du stage, nous avons constate un decalage important entre les besoins
de recrutement local en Tunisie et les outils effectivement disponibles pour les
candidats. L'analyse de l'existant a fait ressortir quatre limites majeures :
\begin{enumerate}
  \item L'absence d'offres d'emploi localisees en francais (et plus largement adaptees
    au contexte tunisien), ce qui limite l'accessibilite pour les candidats.
  \item La redirection des candidats tunisiens vers un formulaire de candidature
    en allemand, faisant reference a des institutions telles que l'\textit{Agentur fur Arbeit},
    sans equivalent en Tunisie.
  \item L'absence d'un systeme de suivi des candidatures (ATS), contraignant
    l'equipe RH a gerer les dossiers manuellement par email.
  \item Un circuit de candidature non maitrise localement : en pratique, les
    candidatures issues de Tunisie ne sont pas traitees dans un flux RH tunisien
    dedie, ce qui reduit fortement la probabilite d'un retour clair et rapide
    pour le candidat.
\end{enumerate}

En consequence, une partie des chercheurs d'emploi continue de recourir a des
methodes classiques (depot physique ou envoi postal via la Poste Tunisienne),
sans accuse de reception, sans suivi d'etat, et souvent sans reponse formelle sur
l'issue de la candidature. Ce constat a constitue le point de depart de notre
travail.

\section*{Contributions}
Pour repondre a ces limites, nous avons concu et developpe une plateforme de
recrutement composee de trois applications complementaires :
\begin{enumerate}
  \item Une \textbf{application web RH} permettant la publication d'offres adaptees
    au marche tunisien, la gestion des candidatures via un tableau Kanban,
    et l'analyse IA des profils.
  \item Une \textbf{interface d'administration} pour la gestion des comptes RH
        et des templates d'offres.
  \item Une \textbf{application mobile progressive (PWA)} permettant aux candidats
        de postuler, suivre leur candidature en temps reel, et generer leur CV.
\end{enumerate}

L'objectif principal est de retablir une chaine de recrutement locale, tracable
et reactive, adaptee a Schulte Tunisia et a son bassin de candidats.

\section*{Plan du rapport}
Le present rapport est organise en quatre chapitres. Le \textbf{chapitre 1}
presente l'organisme d'accueil et l'etude de l'existant. Le \textbf{chapitre 2}
expose l'etat de l'art et les choix technologiques. Le \textbf{chapitre 3}
detaille la conception et l'architecture de la solution. Le \textbf{chapitre 4}
presente la realisation, les tests et l'evaluation.

\newpage

% ════════════════════════════════════════════════════════════════
%  CHAPITRE 1 — CADRE DU PROJET
% ════════════════════════════════════════════════════════════════
\chapter{Cadre du Projet}

\section{Presentation de l'organisme d'accueil}

\subsection{Schulte \& Co. GmbH}
Schulte \& Co. GmbH est un groupe industriel allemand specialise dans la fabrication
de composants electriques et electroniques pour l'industrie automobile, notamment
les assemblages de cables, les barres omnibus et les systemes de connexion.
Le groupe evolue dans un environnement exigeant en termes de qualite, de delais
et de tracabilite, avec des certifications reconnues telles que ISO 9001,
IATF 16949, ISO 14001 et ISO 45001.

\subsection{Schulte Automotive Tunisia Sarl}
Schulte Automotive Tunisia Sarl constitue l'entite locale du groupe en Tunisie.
L'entreprise opere sur deux sites de production, a Bouarada et a Zaghouan, avec
une organisation RH distribuee par site. Cette configuration multi-sites implique
des besoins clairs en matiere de recrutement : publication ciblee des offres,
suivi structure des candidatures, et separation stricte des donnees entre sites.

\begin{table}[H]
\centering
\caption{Presentation des sites de production tunisiens}
\begin{tabularx}{\textwidth}{|l|X|X|}
\hline
\textbf{Critere} & \textbf{Bouarada} & \textbf{Zaghouan} \\
\hline
Localisation & Bouarada, gouvernorat de Siliana & Zaghouan \\
\hline
Annee de creation & 2012 & 2016 \\
\hline
Effectif approximatif & \textasciitilde 180 employes & \textasciitilde 120 employes \\
\hline
Activite dominante & Assemblage de cables & Production de faisceaux \\
\hline
\end{tabularx}
\end{table}

\subsection{Positionnement du stage}
Dans le cadre de ce stage, nous avons travaille sur la digitalisation complete
du recrutement local. L'objectif n'etait pas uniquement de creer une interface,
mais de reconstruire un flux metier de bout en bout : diffusion d'offres,
candidature, qualification, suivi de statut, planification d'entretien et
notification des parties prenantes.

\section{Etude de l'existant}

\subsection{Processus de recrutement avant projet}
Avant la mise en place de notre solution, le recrutement presentait un fonctionnement
fragmente. Les offres accessibles aux candidats locaux provenaient principalement
du site du groupe, avec un parcours non adapte au contexte tunisien. Les candidats
etaient rediriges vers des formulaires en allemand comportant des references
administratives non pertinentes localement. En parallele, la gestion RH des
dossiers se faisait de maniere manuelle via email, sans pipeline centralise.

\subsection{Limites majeures identifiees}
Notre observation terrain a permis d'identifier les limites suivantes :
\begin{enumerate}
  \item Inadaption linguistique : l'absence d'un parcours candidat en francais
        cree une barriere directe a l'entree.
  \item Inadaption administrative : les formulaires mentionnent des institutions
        allemandes sans equivalent tunisien.
  \item Absence de chaine locale maitrisee : les candidatures tunisiennes ne
        suivent pas un circuit RH local clairement trace.
  \item Absence de suivi candidat : pas d'accuse de reception, pas de statut
        visible, pas de delai de retour formalise.
  \item Traitement manuel RH : tri des candidatures, relances et classement
        effectues sans ATS, avec risque d'erreur et perte d'information.
  \item Non-separation operationnelle des sites : difficultes de filtrage
        immediat par site (Bouarada ou Zaghouan) dans l'ancien mode de travail.
\end{enumerate}

\subsection{Constat terrain sur les pratiques de candidature}
En l'absence d'un portail numerique local fiable, une partie des candidats
continue d'utiliser des canaux classiques, notamment le depot physique et
l'envoi postal via la Poste Tunisienne. Dans ce schema, le candidat ne dispose
generalement ni d'un suivi d'etat ni d'un retour structure sur l'issue de sa
demande. Ce point a ete determinant dans la definition du besoin fonctionnel.

\subsection{Impacts metier de l'existant}
Ces limites ont des consequences directes :
\begin{enumerate}
  \item Cote candidat : frustration, abandon de candidature, manque de visibilite.
  \item Cote RH : charge operationnelle elevee, difficultes de priorisation,
        faible tracabilite des decisions.
  \item Cote entreprise : perte potentielle de profils qualifies et allongement
        du cycle de recrutement.
\end{enumerate}

\section{Besoin identifie et orientation de la solution}

\subsection{Besoins fonctionnels prioritaires}
A partir du diagnostic, nous avons formalise les besoins suivants :
\begin{enumerate}
  \item Publier des offres localisees et comprehensibles pour le marche tunisien.
  \item Permettre une candidature numerique simple depuis mobile et desktop.
  \item Mettre en place un suivi de candidature clair, visible et evolutif.
  \item Offrir aux RH un pipeline Kanban pour piloter le cycle de recrutement.
  \item Isoler les donnees par site pour respecter l'organisation multi-usines.
  \item Notifier en temps reel les changements de statut et les actions critiques.
\end{enumerate}

\subsection{Besoins non fonctionnels}
En plus des fonctions metier, la solution devait repondre a des exigences
transverses :
\begin{enumerate}
  \item Securite : authentification JWT, controle par role et par site.
  \item Performance : experience fluide sur mobile et web.
  \item Maintenabilite : architecture modulaire et code TypeScript.
  \item Evolutivite : possibilite d'ajouter de nouveaux modules sans refonte.
  \item Disponibilite : acces simple pour les candidats, y compris dans un
        contexte de connectivite variable.
\end{enumerate}

\subsection{Reponse apportee par notre projet}
Pour repondre a ces besoins, nous avons developpe une plateforme composee de
trois applications complementaires :
\begin{enumerate}
  \item Une application RH pour la gestion complete des offres et des candidatures.
  \item Une application d'administration pour le pilotage des comptes et templates.
  \item Une PWA candidat pour postuler, suivre son dossier et generer un CV.
\end{enumerate}
Cette approche permet de replacer le recrutement dans un circuit local, lisible,
tracable et reactif, tout en conservant la coherence globale avec les exigences
du groupe.

\subsection{Conclusion du chapitre}
Ce premier chapitre montre que le probleme n'etait pas uniquement technique,
mais organisationnel et operationnel. Nous avons donc base notre demarche sur
un constat reel du terrain, puis transforme ce constat en exigences concretes.
Le chapitre suivant presente l'etat de l'art des ATS et les technologies retenues
pour implementer cette reponse.

\newpage

% ════════════════════════════════════════════════════════════════
%  CHAPITRE 2 — ETAT DE L'ART ET CHOIX TECHNOLOGIQUES
% ════════════════════════════════════════════════════════════════
\chapter{Etat de l'Art et Choix Technologiques}

\section{Les systemes de gestion des candidatures (ATS)}

Le recrutement numerique repose aujourd'hui sur une categorie d'outils
specialises : les Applicant Tracking Systems, ou ATS. Un ATS est un logiciel
qui centralise l'ensemble du cycle de recrutement, de la publication des offres
a la decision finale d'embauche. Selon le SHRM (Society for Human Resource
Management), plus de 75\% des recruteurs utilisent un ATS pour filtrer les
candidatures avant tout examen humain \cite{shrm2023}.

Nous avons analyse le marche avant de justifier notre choix de developpement
sur mesure. Quatre familles de solutions ont ete evaluees.

\subsection{Comparaison des solutions existantes}

\begin{table}[H]
\centering
\caption{Comparaison des solutions ATS du marche}
\begin{tabularx}{\textwidth}{|l|l|X|X|}
\hline
\textbf{Solution} & \textbf{Type} & \textbf{Points forts} & \textbf{Limites} \\
\hline
Workday & SaaS payant & Complet, integrations ERP, reporting avance &
Cout prohibitif, complexite d'implementation, sur-dimensionne pour PME \\
\hline
Taleo (Oracle) & SaaS payant & Maturite enterprise, fiabilite &
Tres couteux, interface vieillissante, hebergement hors Tunisie \\
\hline
Greenhouse & SaaS payant & UX moderne, API riche, workflows configurables &
Payant, donnees stockees a l'etranger, pas d'isolation multi-site \\
\hline
OpenCATS & Open source & Gratuit, auto-hebergeable &
Peu maintenu, pas de temps reel, pas d'IA, interface obsolete \\
\hline
Notre solution & Sur mesure & Multi-site isole, IA integree, PWA, contexte
tunisien & Developpement initial plus long \\
\hline
\end{tabularx}
\end{table}

\subsection{Justification du developpement sur mesure}

Trois obstacles structurels rendent les solutions commerciales inadaptees
au contexte de Schulte Tunisia.

Le premier obstacle est \textbf{economique}. Les solutions SaaS facturent
entre 200 et 800 dollars par mois pour une PME industrielle. Ce modele
tarifaire est incompatible avec la realite d'une manufacture tunisienne
de taille intermediaire comme Schulte Automotive Tunisia Sarl.

Le deuxieme obstacle est \textbf{architectural}. Aucune solution du marche
ne supporte nativement la notion de sites de production multiples avec
isolation stricte des donnees. Notre contrainte est precise : les RH de
Bouarada ne doivent pas voir les candidatures de Zaghouan, et inversement.
Nous avons implemente cette isolation via un champ \texttt{site} sur chaque
offre et chaque utilisateur RH, avec verification systematique cote serveur
a chaque requete.

Le troisieme obstacle est \textbf{contextuel}. Le marche de l'emploi tunisien
presente des specificites que les ATS internationaux ignorent : validation du
numero de telephone tunisien, formulaires en francais, et pratiques locales
comme l'envoi de CV par la Poste Tunisienne --- pratique encore courante que
nous avons observee directement sur le terrain a Bouarada lors de notre stage.
Aucun ATS du marche ne modelise ces realites.

\section{Technologies utilisees}

Le choix des technologies a ete guide par trois criteres : la coherence de
la pile technique (JavaScript full-stack), la maturite des outils, et leur
adequation aux besoins specifiques de chaque application.

\subsection{Next.js 15 --- Framework de la PWA candidat}

Next.js est un framework React developpe par Vercel. Nous avons utilise la
version 15 avec l'App Router, qui introduit un modele de rendu hybride
permettant de choisir, route par route, entre rendu serveur (SSR), generation
statique (SSG) et rendu client (CSR). Ce modele est particulierement adapte
a notre PWA candidat : les pages de listing d'offres beneficient du rendu
serveur pour le referencement, tandis que les pages interactives (candidature,
profil) fonctionnent en mode client.

Next.js 15 apporte egalement Turbopack comme bundler de developpement,
le code splitting automatique par route, et une compatibilite native avec
TypeScript 5.7. Nous avons configure la PWA via le plugin
\texttt{@ducanh2912/next-pwa}, qui genere automatiquement le Service Worker
et le fichier manifest au moment du build de production.

\subsection{React 18 et Vite 5 --- Application HR/Admin}

L'application HR/Admin est une Single Page Application (SPA) construite avec
React 18 et Vite 5. Contrairement a la PWA candidat qui necessite le rendu
serveur de Next.js, l'application RH est un outil interne dont le
referencement n'est pas une priorite. Vite offre un serveur de developpement
quasi-instantane grace a son architecture basee sur les modules ES natifs du
navigateur, et un build de production optimise via Rollup.

React 18 introduit les transitions concurrentes et le batching automatique
des mises a jour d'etat, ce qui ameliore la fluidite du tableau Kanban lors
des operations de drag-and-drop sur de grands volumes de candidatures.

\subsection{Node.js et Express 5 --- API Backend}

Node.js est un environnement d'execution JavaScript cote serveur base sur
le moteur V8 de Chrome. Son modele evenementiel non-bloquant est
particulierement adapte a notre architecture : le backend doit gerer
simultanement des requetes HTTP, des connexions WebSocket persistantes,
et des jobs cron, sans bloquer le thread principal.

Nous avons utilise Express 5, la derniere version majeure du framework,
qui apporte la gestion native des erreurs asynchrones sans necessiter de
\texttt{try/catch} explicites dans chaque route. L'ensemble du backend est
ecrit en TypeScript avec une cible de compilation ES2022.

\subsection{PostgreSQL 16 et Prisma 6 --- Persistance des donnees}

PostgreSQL est un systeme de gestion de base de donnees relationnelle open
source reconnu pour sa robustesse et sa conformite aux standards SQL. Nous
avons choisi PostgreSQL 16 pour sa gestion native des tableaux (champ
\texttt{String[]} pour les competences requises et les tags RH), des types
JSON (champ \texttt{aiAnalysis} stockant le resultat complet de l'analyse IA),
et des contraintes d'unicite composites (une seule candidature par couple
candidat/offre).

Prisma 6 est un ORM de nouvelle generation qui genere automatiquement les
types TypeScript depuis le schema de base de donnees. Cette approche
\textit{schema-first} garantit la coherence entre la structure de la base
et le code applicatif a la compilation, eliminant une categorie entiere
d'erreurs de type au runtime. Prisma gere egalement les migrations
versionnees et les transactions atomiques, que nous utilisons notamment
pour la gestion du CV par defaut du candidat.

Notre schema compte \textbf{8 modeles} : User, CandidateCV, JobOffer,
OfferTemplate, Application, Interview, Notification, et RefreshToken.

\subsection{Socket.io 4 --- Communication temps reel}

Socket.io est une bibliotheque JavaScript permettant la communication
bidirectionnelle en temps reel entre clients et serveur. Elle utilise
WebSocket comme transport principal, avec un fallback automatique vers
le long-polling HTTP lorsque WebSocket n'est pas disponible.

Dans notre implementation, chaque utilisateur connecte est assigne a
des \textit{rooms} Socket.io selon son role et son site :

\begin{itemize}
  \item \texttt{user:\{id\}} --- room personnelle, tous les roles
  \item \texttt{candidate:\{id\}} --- candidats uniquement
  \item \texttt{hr:\{id\}} --- utilisateurs RH et Admin
  \item \texttt{site:Bouarada} / \texttt{site:Zaghouan} --- isolation par site
  \item \texttt{admin} --- administrateurs uniquement
\end{itemize}

Ce systeme de rooms permet d'envoyer des evenements cibles : quand un
candidat soumet une candidature, seuls les RH du site concerne recoivent
l'evenement \texttt{application:new}. Quand le RH change le statut d'une
candidature, seul le candidat concerne recoit l'evenement
\texttt{status:changed}. L'authentification Socket.io est assuree par
le meme token JWT que l'API REST, verifie dans un middleware dedie avant
toute connexion.

\subsection{Intelligence Artificielle --- Strategie multi-fournisseurs}

Notre pipeline d'analyse IA est concu pour maximiser la disponibilite
tout en minimisant les couts. Nous avons adopte une architecture a deux
niveaux.

\subsubsection{Analyse automatique a la soumission (backend)}

A chaque nouvelle candidature, le backend lance une analyse IA en
arriere-plan de maniere non-bloquante. Le moteur \texttt{AIBattleService}
interroge les fournisseurs dans un ordre croissant de cout :

\begin{enumerate}
  \item \textbf{Gemini 2.5 Flash Lite} (Google) --- modele le plus economique
  \item \textbf{Gemini 2.5 Flash} (Google) --- si le premier echoue
  \item \textbf{OpenRouter Free Auto} --- si les deux Gemini echouent
\end{enumerate}

Le moteur s'arrete au premier succes, evitant de consommer inutilement
des quotas. Si tous les fournisseurs sont indisponibles, un algorithme
de repli par correspondance de mots-cles sur les competences requises
produit un score approximatif.

\subsubsection{Analyse manuelle par le RH (frontend)}

Depuis le panneau de revue candidat, le RH peut declencher une analyse
duale qui interroge simultanement deux fournisseurs :

\begin{itemize}
  \item \textbf{Puter.js} --- bibliotheque browser-side donnant acces a
        GPT-4o (OpenAI) gratuitement, sans cle API, directement depuis
        le navigateur du RH
  \item \textbf{Gemini 2.5 Flash} --- via l'API backend, en reutilisant
        l'analyse deja stockee en base si elle existe (economie de tokens)
\end{itemize}

Les deux resultats sont fusionnes : le score final est la moyenne des
deux scores, la recommandation finale est la plus conservative des deux
(principe de prudence). En cas de desaccord entre les deux IA, le systeme
l'indique explicitement au RH avec une note de divergence.

\subsubsection{Format de sortie IA}

Chaque analyse produit un objet JSON structure contenant :
\texttt{score} (0--100), \texttt{confidence} (\texttt{high}/\texttt{medium}/\texttt{low}
base sur la longueur du texte CV), \texttt{recommendation}
(\texttt{Hire}/\texttt{Interview}/\texttt{Request More Info}/\texttt{Reject}),
\texttt{strengths}, \texttt{gaps}, \texttt{tips\_for\_candidate}, et
\texttt{reasoning} en francais. Le prompt est partage entre le backend et
le frontend via un fichier texte unique
(\texttt{hr/public/shared/analysis-prompt.txt}), garantissant que les deux
niveaux d'analyse utilisent exactement les memes instructions.

\subsection{Progressive Web App (PWA)}

Une Progressive Web App est une application web qui integre des
fonctionnalites natives grace a deux composants techniques : un
\textit{Service Worker} et un fichier \textit{manifest}.

Le Service Worker est un script JavaScript qui s'execute en arriere-plan,
independamment de la page web. Il intercepte les requetes reseau et peut
les servir depuis un cache local, permettant un fonctionnement partiel
hors ligne. Notre configuration definit quatre strategies de cache :

\begin{itemize}
  \item \textbf{CacheFirst} pour les assets statiques (icones, polices,
        manifest) --- servis depuis le cache sans requete reseau
  \item \textbf{StaleWhileRevalidate} pour les fichiers JavaScript et CSS
        --- servis depuis le cache immediatement, mis a jour en arriere-plan
  \item \textbf{NetworkFirst} pour les appels API --- tente le reseau d'abord,
        fallback cache si hors ligne (TTL 24h, timeout reseau 3 secondes)
  \item \textbf{CacheFirst} pour les CVs uploades --- fichiers PDF mis en
        cache 7 jours
\end{itemize}

Le fichier manifest definit le nom de l'application, les icones, la
couleur de theme (\texttt{\#2563eb}), et le mode d'affichage
\texttt{standalone} qui masque la barre d'adresse du navigateur lors
de l'installation. La PWA est desactivee en mode developpement et
activee uniquement en production via la configuration Next.js.

\section{Conclusion du chapitre}

Nous avons presente dans ce chapitre l'etat de l'art des systemes ATS
et justifie notre choix de developpement sur mesure par trois obstacles
concrets : le cout des solutions commerciales, l'absence de support
multi-site isole, et l'inadaptation au contexte tunisien. Nous avons
ensuite detaille les technologies retenues : Next.js 15 pour la PWA
candidat, React 18 et Vite 5 pour l'application RH, Node.js avec Express 5
pour le backend, PostgreSQL 16 avec Prisma 6 pour la persistance, Socket.io 4
pour le temps reel, une strategie IA multi-fournisseurs (Gemini et Puter.js),
et les mecanismes PWA pour l'experience mobile. Le chapitre suivant presente
la conception et l'architecture detaillee de la solution.

\newpage

% % CHAPITRE 3 — version dediee
\chapter{Conception et Architecture de la Solution}
\graphicspath{{Isipfe/Figures/}{diagramms/}}

\section{Introduction}

Ce chapitre formalise la conception de la plateforme de recrutement en reliant chaque besoin metier a une decision technique verifiable. Le travail de conception a ete mene sur les deux sites de l'entreprise (Bouarada et Zaghouan), avec un meme objectif: obtenir un systeme unique, securise, et exploitable sans divergence de regles entre acteurs.

La structure du chapitre suit une progression logique: planification et conduite Agile, cadrage des exigences, modelisation UML des flux, architecture logicielle, securite, donnees, puis gouvernance et automatisations. Chaque section ne decrit pas seulement un choix de conception; elle precise aussi les garde-fous retenus pour traiter les cas limites observes pendant le developpement.

\section{Demarche de conception et planification}

La conception a commence par une phase de planification pour eviter les iterations non maitrisees. Le cadrage a fixe un ordre de travail clair: collecte terrain, modelisation, validation technique, puis consolidation. A chaque etape, un livrable etait valide (diagrammes, decisions d'architecture, regles de gestion) avant le passage a la suivante.

\begin{figure}[H]
\centering
\includegraphics[width=0.86\textwidth]{gantt_mois_1_2.jpg}
\caption{Planification de conception -- Mois 1 et 2}
\end{figure}

Le premier Gantt couvre le cadrage : collecte des besoins, premiers modeles UML et validation des scenarios metier critiques.

\begin{figure}[H]
\centering
\includegraphics[width=0.86\textwidth]{gantt_mois_3_4.jpg}
\caption{Planification de conception -- Mois 3 et 4}
\end{figure}

Le second Gantt couvre la consolidation : finalisation de l'architecture, verrouillage du schema de donnees et preparation de la realisation.

\section{Conduite Agile du projet}

\subsection{Cadre Agile adopte}

Le cadre Scrum a ete adapte a l'echelle du projet PFE. Le product backlog a ete maintenu avec l'equipe RH, la planification s'est faite en cycles courts, et chaque sprint s'est termine par une revue fonctionnelle suivie d'une retrospective. Ce rythme a permis de corriger rapidement les ecarts entre maquette, logique metier et comportement reel de l'application.

\begin{table}[H]
\centering
\caption{Organisation Agile du chapitre de conception}
\begin{tabularx}{\textwidth}{|l|X|X|}
\hline
\textbf{Release} & \textbf{But} & \textbf{Sprints couverts} \\
\hline
Release 1 & Construire le flux recrutement de bout en bout (authentification, candidature, traitement RH) & S1, S2, S3, S4 \\
\hline
Release 2 & Stabiliser la gouvernance, la securite operationnelle et l'exploitation & S5, S6 \\
\hline
\end{tabularx}
\end{table}

\subsection{Sprint 1 -- Initiation et authentification}

\textbf{Vue technique} : ce sprint s'appuie sur les diagrammes d'inscription, verification email, connexion, generation des jetons et rotation des refresh tokens.

\begin{table}[H]
\centering
\caption{Backlog du sprint 1}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{ID} & \textbf{User story} & \textbf{Priorite} & \textbf{Critere d'acceptation} \\
\hline
S1-US1 & En tant que candidat, je cree un compte avec email valide. & Haute & Compte cree, verification requise avant connexion. \\
\hline
S1-US2 & En tant que candidat, je recois et renvoie un code de verification. & Haute & Verification email reussie, gestion expiration/rate-limit. \\
\hline
S1-US3 & En tant qu'utilisateur authentifie, je dispose d'un acces securise via JWT + refresh token. & Haute & Login, refresh, rotation et revocation fonctionnels. \\
\hline
\end{tabularx}
\end{table}

\begin{table}[H]
\centering
\caption{Tableau de taches du sprint 1}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{Tache} & \textbf{Description} & \textbf{Charge} & \textbf{Sortie} \\
\hline
S1-T1 & Endpoints \texttt{/auth/login}, \texttt{/auth/verify-email}, \texttt{/auth/resend}. & 2 j.h & API d'authentification candidate. \\
\hline
S1-T2 & Middleware de controle role/session + gestion cookies securises. & 1.5 j.h & Controle d'acces unifie RH/Admin/Candidat. \\
\hline
S1-T3 & Rotation refresh token + invalidation immediate compte inactif. & 1.5 j.h & Chaine de session robuste. \\
\hline
\end{tabularx}
\end{table}

\subsection{Sprint 2 -- Parcours candidat et depot de candidature}

\textbf{Vue technique} : ce sprint est aligne sur les diagrammes de creation CV (upload/builder), selection de CV et depot de candidature.

\begin{table}[H]
\centering
\caption{Backlog du sprint 2}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{ID} & \textbf{User story} & \textbf{Priorite} & \textbf{Critere d'acceptation} \\
\hline
S2-US1 & En tant que candidat, je gere ma bibliotheque de CV. & Haute & Upload PDF + builder + selection CV actifs. \\
\hline
S2-US2 & En tant que candidat, je postule a une offre avec un CV choisi. & Haute & Depot en base + accuse de prise en compte. \\
\hline
S2-US3 & En tant que systeme, je bloque les doublons candidat/offre. & Haute & Refus metier si candidature deja existante. \\
\hline
\end{tabularx}
\end{table}

\begin{table}[H]
\centering
\caption{Tableau de taches du sprint 2}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{Tache} & \textbf{Description} & \textbf{Charge} & \textbf{Sortie} \\
\hline
S2-T1 & Module CV: upload, extraction texte et mode builder. & 2.5 j.h & Donnees CV reutilisables dans le dossier candidat. \\
\hline
S2-T2 & Endpoint de soumission candidature avec validations metier. & 2 j.h & Depot candidature fiable et trace. \\
\hline
S2-T3 & Regle d'unicite candidature par offre. & 1 j.h & Prevention des dossiers redondants. \\
\hline
\end{tabularx}
\end{table}

\subsection{Sprint 3 -- Traitement RH, statuts et entretiens}

\textbf{Vue technique} : ce sprint mobilise les diagrammes de transitions Kanban, planification et outcome d'entretien.

\begin{table}[H]
\centering
\caption{Backlog du sprint 3}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{ID} & \textbf{User story} & \textbf{Priorite} & \textbf{Critere d'acceptation} \\
\hline
S3-US1 & En tant que RH, je deplace une candidature entre statuts valides. & Haute & Transitions controlees sans etat incoherent. \\
\hline
S3-US2 & En tant que RH, je planifie un entretien et je peux le replanifier. & Haute & Dates/horaires persistants et historises. \\
\hline
S3-US3 & En tant que RH, je saisis un resultat d'entretien. & Haute & Outcome (\texttt{pass}/\texttt{fail}/\texttt{no\_show}) enregistre et exploite. \\
\hline
\end{tabularx}
\end{table}

\begin{table}[H]
\centering
\caption{Tableau de taches du sprint 3}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{Tache} & \textbf{Description} & \textbf{Charge} & \textbf{Sortie} \\
\hline
S3-T1 & API de mise a jour statut avec normalisation des valeurs UI. & 1.5 j.h & Cycle d'etat coherent (\texttt{new} vers \texttt{reviewing}, etc.). \\
\hline
S3-T2 & Module planification entretien + edition/replanification. & 2 j.h & Workflow entretien complet. \\
\hline
S3-T3 & Enregistrement outcome et propagation metier. & 1.5 j.h & Decision RH tracee jusqu'aux etats finaux. \\
\hline
\end{tabularx}
\end{table}

\subsection{Sprint 4 -- Analyse IA dual-provider et temps reel}

\textbf{Vue technique} : ce sprint suit les diagrammes Puter.js, Gemini, fusion IA, normalisation backend et emission Socket.io.

\begin{table}[H]
\centering
\caption{Backlog du sprint 4}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{ID} & \textbf{User story} & \textbf{Priorite} & \textbf{Critere d'acceptation} \\
\hline
S4-US1 & En tant que RH, je lance une analyse IA sans bloquer le flux candidat. & Haute & Analyse asynchrone fonctionnelle. \\
\hline
S4-US2 & En tant que RH, je consulte un resultat fusionne et lisible. & Haute & Score + recommandation + justification coherents. \\
\hline
S4-US3 & En tant qu'utilisateur, je vois les mises a jour en temps reel. & Haute & Evenements Socket propages aux bons clients. \\
\hline
\end{tabularx}
\end{table}

\begin{table}[H]
\centering
\caption{Tableau de taches du sprint 4}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{Tache} & \textbf{Description} & \textbf{Charge} & \textbf{Sortie} \\
\hline
S4-T1 & Pipeline asynchrone IA cote backend + snapshot candidature. & 2 j.h & Analyse declenchee sans ralentir le depot. \\
\hline
S4-T2 & Fusion des resultats Puter.js/Gemini et persistance finale. & 2 j.h & Resultat IA unifie et exploitable RH. \\
\hline
S4-T3 & Evenements Socket (\texttt{status:changed}, \texttt{ai:analysis\_complete}). & 1.5 j.h & Synchronisation RH/candidat en temps reel. \\
\hline
\end{tabularx}
\end{table}

\subsection{Sprint 5 -- Gouvernance administrative}

\textbf{Vue technique} : ce sprint couvre la creation des comptes RH, leur cycle de vie, la gestion des templates et le broadcast admin.

\begin{table}[H]
\centering
\caption{Backlog du sprint 5}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{ID} & \textbf{User story} & \textbf{Priorite} & \textbf{Critere d'acceptation} \\
\hline
S5-US1 & En tant qu'admin, je cree et maintiens les comptes RH. & Haute & Creation, activation, desactivation et suppression maitrisees. \\
\hline
S5-US2 & En tant qu'admin, je gere les templates d'offres. & Moyenne & Templates reutilisables et edition centralisee. \\
\hline
S5-US3 & En tant qu'admin, je diffuse une information globale aux RH. & Moyenne & Message broadcast visible sur tableaux RH. \\
\hline
\end{tabularx}
\end{table}

\begin{table}[H]
\centering
\caption{Tableau de taches du sprint 5}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{Tache} & \textbf{Description} & \textbf{Charge} & \textbf{Sortie} \\
\hline
S5-T1 & Controleur admin pour comptes RH (CRUD logique + suppression definitive). & 2 j.h & Gouvernance comptes stabilisee. \\
\hline
S5-T2 & Gestion centralisee templates et publication guidee. & 1.5 j.h & Homogeneite de redaction des offres. \\
\hline
S5-T3 & Mecanisme broadcast admin vers rooms RH. & 1 j.h & Communication transversale fiabilisee. \\
\hline
\end{tabularx}
\end{table}

\subsection{Sprint 6 -- Stabilisation securite et exploitation}

\textbf{Vue technique} : ce sprint mobilise les diagrammes de rappels automatiques, notifications et architecture de securite en production.

\begin{table}[H]
\centering
\caption{Backlog du sprint 6}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{ID} & \textbf{User story} & \textbf{Priorite} & \textbf{Critere d'acceptation} \\
\hline
S6-US1 & En tant que RH, je recois des rappels automatiques fiables. & Moyenne & Rappels entretien emis a temps. \\
\hline
S6-US2 & En tant qu'equipe projet, nous fiabilisons les erreurs de flux. & Haute & Rollback UI/API propre et messages explicites. \\
\hline
S6-US3 & En tant qu'administrateur, je maitrise les acces sensibles. & Haute & Controles role/site et revocation effectifs. \\
\hline
\end{tabularx}
\end{table}

\begin{table}[H]
\centering
\caption{Tableau de taches du sprint 6}
\begin{tabularx}{\textwidth}{|l|X|l|X|}
\hline
\textbf{Tache} & \textbf{Description} & \textbf{Charge} & \textbf{Sortie} \\
\hline
S6-T1 & Cron de rappel entretien + marquage \texttt{reminderSent}. & 1 j.h & Rappels idempotents et tracables. \\
\hline
S6-T2 & Durcissement des routes sensibles (site ownership, role checks). & 1.5 j.h & Surface d'erreur securite reduite. \\
\hline
S6-T3 & Nettoyage des transitions et retours d'erreur front/backend. & 1.5 j.h & Comportements plus previsibles en exploitation. \\
\hline
\end{tabularx}
\end{table}

\subsection{Retrospective de release}

La retrospective montre que le decoupage en sprints a reduit les retours arriere tardifs. Les sprints 1 a 4 ont produit le flux metier principal (authentification, candidature, traitement RH, analyse), tandis que les sprints 5 et 6 ont porte la stabilisation operationnelle (gouvernance, securite, comportement en erreur). Cette repartition explique pourquoi la charge de fin de cycle reste moderee malgre l'ajout de contraintes de robustesse.

\begin{table}[H]
\centering
\caption{Synthese retrospective des sprints}
\begin{tabularx}{\textwidth}{|l|l|l|X|}
\hline
\textbf{Sprint} & \textbf{Charge prevue} & \textbf{Charge realisee} & \textbf{Observation} \\
\hline
S1 & 5 j.h & 5.5 j.h & Surcout leger du au durcissement de la securite session/token. \\
\hline
S2 & 5.5 j.h & 5 j.h & Bonne cadence grace au perimetre bien decoupe cote candidat. \\
\hline
S3 & 5 j.h & 5.5 j.h & Ajustements supplementaires sur transitions et outcomes entretien. \\
\hline
S4 & 5.5 j.h & 6 j.h & Complexite de fusion IA plus elevee que prevu. \\
\hline
S5 & 4.5 j.h & 4.5 j.h & Gouvernance admin stable, peu de reprises. \\
\hline
S6 & 4 j.h & 4.5 j.h & Stabilisation et tests de fiabilite plus longs en fin de cycle. \\
\hline
\end{tabularx}
\end{table}

\section{Cadrage des exigences}

\subsection{Structure des besoins}

Les besoins ont ete organises en quatre blocs: candidat, RH, administration et exigences transversales. Cette decomposition evite de confondre besoin metier et choix d'implementation.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{vue_globale_exigence_racine_categories.jpg}
\caption{Vue globale des exigences fonctionnelles et transversales}
\end{figure}

Le schema racine fixe le perimetre du produit. Nous y separons clairement ce qui est inclus et ce qui reste hors scope.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{exigences_candidat_req.jpg}
\caption{Detail des exigences du module Candidat}
\end{figure}

Le diagramme candidat couvre toute la chaine : creation de compte, verification email, gestion des CV, depot puis suivi.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{exigences_rh_req.jpg}
\caption{Detail des exigences du module RH}
\end{figure}

Le diagramme RH formalise le cycle metier : tri, changement de statut, planification d'entretien, puis decision finale.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{exigences_admin_transversales.jpg}
\caption{Detail des exigences Administration et contraintes transversales}
\end{figure}

Le diagramme admin regroupe la gouvernance (comptes RH, templates, diffusion) et les contraintes globales de securite et de tracabilite.

\subsection{Acteurs et priorites}

Le systeme repose sur trois acteurs: candidat, RH et administrateur. La separation des roles est stricte, avec isolation multi-site des actions RH. La priorisation suit le chemin critique metier: authentification, candidature, suivi RH, puis automatisations.

\section{Conception architecturale}

\subsection{Vue globale et decomposition technique}

L'architecture retenue est en couches (presentation, metier, persistance). Ce choix permet de faire evoluer les frontends sans destabiliser les regles metier.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{architecture_globale.jpg}
\caption{Architecture globale de la solution}
\end{figure}

La vue globale montre les trois applications et le backend central. Les flux principaux passent en HTTPS REST/JWT, puis en Socket.io pour les mises a jour temps reel.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{architecture_frontends.jpg}
\caption{Architecture des frontends (PWA candidat et interface RH/Admin)}
\end{figure}

La separation des interfaces par usage (PWA candidat, dashboard RH, dashboard admin) reduit la complexite fonctionnelle de chaque ecran.

Sur le plan client, les deux frontends n'appliquent pas la meme strategie de session. La PWA candidat utilise un intercepteur Axios avec file d'attente de rafraichissement (\texttt{refreshPromise}) afin qu'en cas de plusieurs erreurs \texttt{401} simultanees, une seule requete \texttt{/auth/refresh} soit envoyee avant rejeu des requetes en attente. L'interface RH privilegie une session par onglet via \texttt{sessionStorage} (avec fallback), ce qui limite les collisions d'etat quand plusieurs comptes sont ouverts sur le meme navigateur.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{architecture_backend.jpg}
\caption{Architecture du backend Node.js/Express}
\end{figure}

Le backend concentre l'autorisation, la validation metier et l'orchestration des traitements asynchrones (analyse IA, notifications, rappels).

Cette couche centralise aussi des protections transverses: normalisation des statuts entrants (\texttt{review -> reviewing}), verification role/site/propriete sur les routes sensibles, limitation des mises a jour en lot, et validation de formats (date entretien, payload analyse). La centralisation evite des ecarts de comportement entre interfaces RH, admin et candidat.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{architecture_temps_reel_socket_services_externes.jpg}
\caption{Architecture temps reel et services externes}
\end{figure}

Le schema detaille les flux Socket.io (\texttt{status:changed}, \texttt{interview:scheduled}, \texttt{interview:reminder}) et les integrations externes (Gemini, Puter.js, SMTP).

L'implementation Socket repose sur des rooms a granularite metier: \texttt{user:\{id\}}, \texttt{candidate:\{id\}}, \texttt{hr:\{id\}}, \texttt{site:\{site\}} et \texttt{admin}. La connexion est authentifiee par JWT des le handshake; un jeton invalide bloque l'ouverture du canal. Ce choix limite les broadcasts globaux et reduit le risque de diffusion d'evenements hors perimetre.

\subsection{Principes retenus}

Quatre principes structurent la conception: regles metier centralisees cote API, separation stricte des couches, isolation des donnees par site, et traitement asynchrone pour les operations longues.

\section{Conception dynamique du processus de recrutement}

\subsection{Parcours candidat}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{inscription_candidat.jpg}
\caption{Sequence d'inscription candidat}
\end{figure}

Ce diagramme decrit la creation de compte et les validations prealables a l'activation.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{tentative_connexion_avant_verification.jpg}
\caption{Tentative de connexion avant verification email}
\end{figure}

Le flux de connexion avant verification montre le blocage volontaire de l'acces tant que l'email n'est pas confirme.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{verification_email_premiere_connexion.jpg}
\caption{Verification email et premiere connexion}
\end{figure}

Cette etape ferme la boucle d'activation du compte candidat.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{renvoi_code_verification.jpg}
\caption{Renvoi du code de verification}
\end{figure}

Le renvoi de code limite la perte de candidatures quand le mail de verification n'est pas recu ou expire.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{creation_cv_upload_builder.jpg}
\caption{Creation d'un CV (upload PDF ou formulaire)}
\end{figure}

Le candidat peut importer un CV PDF ou produire un CV via le builder. Les validations client et serveur reduisent les dossiers incomplets.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{selection_cv_soumission_candidature.jpg}
\caption{Selection du CV puis soumission}
\end{figure}

Le choix du CV a ete separe de la soumission pour limiter les erreurs de dossier.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{depot_candidature_analyse_ia.jpg}
\caption{Depot de candidature et lancement de l'analyse IA}
\end{figure}

La candidature est enregistree immediatement (\texttt{201 Created}) ; l'analyse IA continue ensuite en arriere-plan.

Au moment du depot, le texte CV est fige dans un instantane (\texttt{cvTextSnapshot}) pour decoupler l'analyse du contenu evolutif de la bibliotheque CV. Cette decision garantit la reproductibilite: une meme candidature est evaluee sur la meme base textuelle, meme si le candidat modifie son CV apres soumission.

\subsection{Orchestration de l'analyse IA}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{analyse_ia_async_notifications_socket.jpg}
\caption{Analyse IA asynchrone et notification temps reel}
\end{figure}

Ce flux montre le decouplage entre depot de candidature et calcul IA, puis la notification automatique du RH.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{analyse_backend_gemini.jpg}
\caption{Analyse IA cote backend (Gemini)}
\end{figure}

Le backend produit une premiere evaluation standardisee a partir du meme prompt partage.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{analyse_puterjs.jpg}
\caption{Analyse IA cote navigateur RH (Puter.js)}
\end{figure}

La voie Puter.js permet une relecture dynamique au moment de l'examen RH, sans bloquer le depot initial.

Le module RH de double analyse applique des gardes techniques explicites: nettoyage des sorties IA (\texttt{parseRawJSON}) pour retirer les enveloppes Markdown, parsing tolerant des anciens formats stockes, et fallback backend si Puter.js est indisponible. Si une analyse backend valide est deja presente dans \texttt{aiAnalysis}, elle est rehydratee pour eviter des appels externes inutiles.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{fusion_resultats_persistance.jpg}
\caption{Fusion des resultats IA et persistance}
\end{figure}

Les sorties IA sont fusionnees (score moyen, recommandation prudente) pour produire un resultat exploitable et trace.

La fusion applique une logique conservative sur la recommandation: en cas de divergence, l'ordre de priorite retenu est \texttt{Reject < Request More Info < Interview < Hire}. Cette regle minimise les faux positifs et preserve une marge de decision humaine sur les dossiers ambigus.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{mise_a_jour_backend_normalisation_notifications.jpg}
\caption{Normalisation backend et diffusion des mises a jour}
\end{figure}

Le backend normalise les donnees (ex. conversion des statuts UI) puis notifie les clients concernes en temps reel.

\subsection{Cycle RH et entretien}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{changement_statut_candidature.jpg}
\caption{Flux de changement de statut d'une candidature}
\end{figure}

Ce diagramme formalise les transitions autorisees dans le Kanban RH.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{action_rh_planification_statut_interview.jpg}
\caption{Action RH et declenchement de planification}
\end{figure}

La planification n'est autorisee qu'apres passage dans l'etat approprie (\texttt{interview}).

La route de planification verifie aussi des preconditions metier strictes: date valide, appartenance site pour les RH, et blocage des candidatures deja finalisees (\texttt{accepted}/\texttt{rejected}). En cas de replanification, l'entretien existant est mis a jour et le drapeau \texttt{reminderSent} est reinitialise afin de relancer proprement le cycle de rappel.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{planification_entretien_initiale.jpg}
\caption{Planification initiale d'un entretien}
\end{figure}

Nous y decrivons la creation d'un rendez-vous avec ses contraintes de base (date, heure, lien ou salle, message).

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{planification_entretien_maj.jpg}
\caption{Mise a jour ou replanification d'entretien}
\end{figure}

Le flux de replanification preserve l'historique pour garder la tracabilite.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{enregistrement_resultat_entretien.jpg}
\caption{Enregistrement du resultat d'entretien}
\end{figure}

La decision d'entretien (\texttt{pass}, \texttt{fail}, \texttt{no\_show}) alimente ensuite la transition vers les etats de fin.

\subsection{Machine a etats candidature}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{vue_ensemble_etats_principaux.jpg}
\caption{Vue d'ensemble des etats candidature}
\end{figure}

Le diagramme fixe le cycle complet, du statut initial aux statuts terminaux.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{detail_etapes_initiales_nouvelle_ia_enexamen.jpg}
\caption{Detail des etapes initiales}
\end{figure}

Nous y precisons la progression controlee entre reception, analyse et examen RH (\texttt{new -> reviewing}).

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{detail_etats_entretien_resultat_fin.jpg}
\caption{Detail des etats entretien et fin de cycle}
\end{figure}

Cette partie explicite les decisions finales et leur impact metier.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{details_transitions_notifications.jpg}
\caption{Transitions d'etat et notifications associees}
\end{figure}

Chaque transition importante declenche une notification ciblee pour le bon acteur.

Pour la consultation RH/Admin, les entretiens sont exposes avec pagination par \texttt{limit} et \texttt{cursor} temporel (\texttt{scheduledAt}). Cette strategie limite les chargements volumineux et facilite un rafraichissement progressif des tableaux de suivi.

\subsection{Cas limites et scenarios d'erreur traites}

La conception dynamique a integre des cas limites reels observes dans le code applicatif, afin d'eviter des incoherences fonctionnelles en production. Le tableau suivant resume les protections principales.

\begin{table}[H]
\centering
\caption{Cas limites integres a la conception dynamique}
\begin{tabularx}{\textwidth}{|l|X|X|}
\hline
\textbf{Cas limite} & \textbf{Regle de conception} & \textbf{Comportement attendu} \\
\hline
Acces RH hors site sur candidature ou entretien & Verification role + site avant lecture/modification & Rejet explicite en \texttt{403} (interdiction inter-site). \\
\hline
Planification d'entretien sur dossier deja finalise & Blocage des statuts terminaux \texttt{accepted}/\texttt{rejected} & Rejet metier en \texttt{409} pour eviter une reouverture implicite. \\
\hline
Soumission de candidature en doublon & Unicite candidat/offre verifiee avant creation & Rejet en \texttt{409} avec message de doublon. \\
\hline
Mise a jour de statut en lot non maitrisee & Limite de taille de lot + transaction atomique & Rejet au dela du seuil; sinon mise a jour coherente de tout le lot. \\
\hline
CV insuffisant ou invalide & Validation de contenu (taille texte, structure formulaire) & Rejet en \texttt{400} avant persistance d'une candidature exploitable. \\
\hline
\end{tabularx}
\end{table}

\section{Conception de la securite}

\subsection{Authentification et cycle des jetons}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{authentification_generation_jetons.jpg}
\caption{Authentification et generation des jetons}
\end{figure}

Ce diagramme presente l'emission du token d'acces et du refresh token.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{rotation_refresh_token.jpg}
\caption{Rotation du refresh token}
\end{figure}

La rotation limite l'impact d'un jeton compromis sur une longue duree.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{acces_securise_revocation_websockets.jpg}
\caption{Acces securise, revocation et controle WebSocket}
\end{figure}

Nous appliquons le meme principe de controle sur HTTP et WebSocket: verification du jeton, revocation immediate des comptes inactifs, et diffusion ciblee selon le role et le site. Le mecanisme de session repose sur un acces token court et un refresh token en rotation, avec invalidation de l'ancien jeton apres renouvellement.

Le refresh token n'est pas stocke en clair: seule une empreinte SHA-256 est persistee en base. Cote navigateur, il est place en cookie \texttt{HttpOnly}, borne au chemin \texttt{/api/auth/refresh}, avec \texttt{sameSite=lax} et \texttt{secure} en production. Ce parametrage reduit les risques d'exfiltration JavaScript et restreint l'usage du cookie au seul endpoint de renouvellement.

\subsection{Comportements de securite applicative}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{connexion_rh.jpg}
\caption{Connexion RH}
\end{figure}

Le flux RH inclut verification de role et perimetre de site.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{connexion_admin.jpg}
\caption{Connexion Admin}
\end{figure}

Le flux admin separe les privileges de gouvernance des operations RH.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{reset_mot_de_passe_rh.jpg}
\caption{Reset de mot de passe RH}
\end{figure}

Cette procedure permet la reprise rapide d'acces sans contournement de securite.

En complement, le front RH traite explicitement les etats de session corrompus (payload utilisateur invalide en stockage local) en nettoyant la session et en revenant a un etat non authentifie. Ce choix evite les ecrans incoherents apres fermeture navigateur ou donnees partielles.

Le controle des origines reseau suit la meme logique defensive: allowlist explicite des URLs clientes, avec options locales strictement controlees pour \texttt{localhost} et les requetes sans en-tete \texttt{Origin}. Ainsi, l'environnement de production reste ferme par defaut, tout en preservant la capacite de test en developpement.

\section{Conception des donnees}

\subsection{Modele metier}

Le modele de donnees est centre sur sept tables pivots : \texttt{Users}, \texttt{OfferTemplates}, \texttt{JobOffers}, \texttt{Applications}, \texttt{Interviews}, \texttt{Notifications}, \texttt{RefreshTokens}.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{diagramme_entites_metier.jpg}
\caption{Diagramme des entites metier}
\end{figure}

Le diagramme mappe les objets metier et leurs relations principales.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{er_utilisateurs_offres.jpg}
\caption{Sous-modele E-R utilisateurs et offres}
\end{figure}

Nous y isolons la relation entre comptes, roles et publication d'offres.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{er_candidatures_cv_entretiens_notifications.jpg}
\caption{Sous-modele E-R candidatures, CV, entretiens et notifications}
\end{figure}

Ce sous-modele formalise le coeur du cycle de recrutement et du suivi candidat.

\subsection{Regles d'integrite}

Les regles d'integrite retenues sont explicites: unicite candidature candidat/offre, relation 1--1 candidature/entretien, rattachement d'offre a un site unique, et conservation des traces de transitions.

Un point sensible concerne le cycle de vie des CV rattaches aux candidatures. Le schema autorise la mise a \texttt{NULL} de la reference CV supprimee, mais la couche metier interdit la suppression d'un CV encore lie a une candidature active. Cette double protection (schema + regle metier) preserve a la fois l'integrite relationnelle et la coherence fonctionnelle.

La datation metier repose sur \texttt{appliedAt} pour l'ordre de traitement RH, complete par \texttt{createdAt}/\texttt{updatedAt} pour la tracabilite technique. Cote candidat, l'affichage applique un fallback robuste (\texttt{appliedAt} puis \texttt{createdAt}) avec verification de validite des dates pour eviter les rendus incoherents.

\section{Conception des composants backend}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{diagramme_repositories.jpg}
\caption{Organisation des repositories backend}
\end{figure}

Le diagramme repositories montre la separation entre acces aux donnees et logique metier.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{diagramme_services_patterns_conception.jpg}
\caption{Services applicatifs et patterns de conception}
\end{figure}

Les services sont organises par responsabilite: auth, notifications, IA, cron, upload.

La couche repository applique des selections defensives du profil candidat (\texttt{candidateSafeSelect}) pour exclure les attributs sensibles des objets retournes aux ecrans RH/Admin. Cette pratique complete l'autorisation: meme en cas d'acces valide, seules les donnees necessaires au cas d'usage sont exposees.

Pour les operations de masse, la conception impose des garde-fous explicites: validation des identifiants, dedoublonnage, plafond de taille de lot, verification de perimetre site pour les RH, puis execution transactionnelle. Cette sequence evite les mises a jour partielles et limite les effets de bord sur les campagnes de tri en volume.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{diagramme_controleur_admincontroller.jpg}
\caption{Conception detaillee du controleur d'administration}
\end{figure}

La vue du controleur admin illustre l'orchestration des operations de gouvernance : comptes RH, templates, suppression logique ou definitive, et broadcast.

La conception backend applique aussi une sanitisation explicite des objets candidats selon le contexte de consultation (liste, entretien, detail), afin d'eviter toute fuite de champs sensibles dans les reponses API.

Sur les endpoints lourds (offres, entretiens), la pagination (\texttt{limit} + \texttt{cursor}) est integree des la conception backend. L'objectif est double: contenir le cout des requetes volumineuses et permettre un chargement incrementiel stable cote frontend, sans rupture de compatibilite quand les parametres sont absents.

\section{Conception RH/Admin et gouvernance}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{creation_compte_rh.jpg}
\caption{Creation d'un compte RH}
\end{figure}

La creation de compte RH est reservee a l'administration avec contraintes de role et controle d'unicite email.

Le perimetre RH est ensuite contraint par site: un RH ne peut agir que sur les offres et candidatures de son site. Cote creation d'offre, l'utilisation d'un template actif est imposee pour les comptes RH, ce qui garantit un cadre de publication homogene et controle par l'administration.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{cycle_vie_compte_rh.jpg}
\caption{Cycle de vie d'un compte RH}
\end{figure}

Le cycle RH formalise activation, desactivation et reactivation pour eviter les etats implicites.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{flux_suppression_compte.jpg}
\caption{Flux de suppression de compte RH}
\end{figure}

La suppression suit un flux controle pour conserver la coherence des donnees dependantes.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{gestion_templates.jpg}
\caption{Gestion des templates d'offres}
\end{figure}

Les templates accelerent la publication tout en gardant un cadre commun entre sites.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{broadcast_admin_vers_rh.jpg}
\caption{Broadcast admin vers RH}
\end{figure}

Ce flux couvre la diffusion d'informations transversales vers les equipes RH.

\section{Notifications et automatisation}

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{notifications_rappel_automatique.jpg}
\caption{Conception des notifications et rappels}
\end{figure}

Nous combinons notifications metier immediates et rappels planifies pour eviter les oublis operatoires.

La chaine de notification est bi-canal: persistance en base (historique, non-lus) puis emission Socket ciblee vers l'acteur concerne. Si le client est temporairement hors ligne, l'etat reste recuperable via l'API \texttt{/notifications}, dont la reponse est bornee par un \texttt{limit} pour maitriser la charge.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{rappel_automatique_entretien.jpg}
\caption{Rappel automatique d'entretien}
\end{figure}

Le rappel d'entretien est planifie automatiquement (cron) pour fiabiliser la presence aux rendez-vous.

Du cote client candidat, les actions de lecture/suppression de notifications utilisent un mecanisme d'optimistic update avec rollback en cas d'echec API. Cette decision de conception maintient une interface reactive sans sacrifier la coherence finale des donnees affichees.

\section{Synthese des choix de conception}

\begin{table}[H]
\centering
\caption{Traçabilite exigences -> conception}
\begin{tabularx}{\textwidth}{|l|X|X|}
\hline
\textbf{Exigence} & \textbf{Traduction conception} & \textbf{Preuve UML / composant} \\
\hline
Depot candidature fluide & Soumission asynchrone + analyse IA en arriere-plan & Diagrammes de depot, analyse asynchrone et normalisation \\
\hline
Isolement multi-site RH & Verification role/site sur routes sensibles & Diagrammes RH, entretiens et couche d'autorisation \\
\hline
Suivi temps reel & Diffusion Socket.io ciblee & Architecture temps reel + diagrammes de transitions \\
\hline
Cycle entretien traçable & Etats explicites + transitions controlees & Diagrammes d'etats et d'entretien \\
\hline
Securite d'acces & JWT court + refresh rotation + revocation & Diagrammes d'authentification et de revocation \\
\hline
\end{tabularx}
\end{table}

\subsection{Verification croisee conception-code}

Pour limiter l'ecart entre la conception et l'implementation reelle, nous avons aligne les decisions d'architecture sur des points de controle observables dans le code. Cette verification croisee rend les choix defendables, car chaque principe peut etre rattache a un mecanisme concret.

\begin{table}[H]
\centering
\caption{Matrice de verification conception -> implementation}
\begin{tabularx}{\textwidth}{|l|X|X|}
\hline
\textbf{Axe} & \textbf{Choix de conception} & \textbf{Mecanisme implemente} \\
\hline
Session securisee & Acces court + refresh avec rotation & Suppression de l'ancien refresh token, emission d'un nouveau, cookie \texttt{HttpOnly} borne a \texttt{/api/auth/refresh}. \\
\hline
Isolement multi-site & RH limite a son perimetre & Verifications role/site sur lectures et actions sensibles; rejet explicite des acces inter-site. \\
\hline
Coherence des statuts & Transitions maitrisees & Normalisation \texttt{review -> reviewing}, blocage des cas terminaux pour la planification, et controles en lot transactionnels. \\
\hline
Temps reel fiable & Notification ciblee par acteur & Rooms Socket par role/site/utilisateur, plus persistance DB pour reprise apres deconnexion client. \\
\hline
Scalabilite lecture & Limiter les charges volumineuses & Parametres \texttt{limit}/\texttt{cursor} sur endpoints lourds (offres, entretiens, notifications). \\
\hline
\end{tabularx}
\end{table}

\subsection{Hypotheses et limites de conception}

La conception retenue est adaptee au contexte actuel du projet et de l'entreprise. Elle repose sur des hypotheses explicites, qui delimitent aussi ses limites:
\begin{itemize}
  \item le perimetre metier cible deux sites (Bouarada et Zaghouan) avec des roles RH/Admin/Candidat bien separes;
  \item la plateforme privilegie la cohesion fonctionnelle d'un backend central, sans decomposition microservices;
  \item l'analyse IA reste un outil d'aide a la decision, et non un mecanisme de decision automatique;
  \item la strategie temps reel est basee sur Socket.io, sans ajout d'un bus de messages externe dans cette phase;
  \item la robustesse en echec est traitee au niveau applicatif (fallbacks, rollback UI, validations), sans infrastructure distribuee additionnelle.
\end{itemize}

Ces limites sont assumees dans la phase PFE pour conserver un niveau de complexite compatible avec les objectifs academiques et les contraintes de delai, tout en garantissant une base evolutive pour les perspectives du chapitre suivant.

\section{Conclusion}

Ce chapitre a etabli une conception complete de la solution, depuis la planification jusqu'aux choix d'architecture et de securite. Les modeles UML, les tableaux Agile et les regles d'integrite presentes ici ont servi de cadre de reference pour la realisation.

L'apport principal de cette conception tient a la formalisation des cas limites: isolation inter-site, protection des etats terminaux, validation stricte des CV, gestion transactionnelle des actions en lot, et comportement robuste en cas d'erreur de session ou de notification. Le chapitre suivant presente la mise en oeuvre de ces choix et les validations obtenues en execution.

% ════════════════════════════════════════════════════════════════
%  CHAPITRE 4 — REALISATION ET TESTS
% ════════════════════════════════════════════════════════════════
\chapter{Realisation et Tests}

\section{Environnement de developpement}

\begin{table}[H]
\centering
\caption{Environnement technique}
\begin{tabularx}{\textwidth}{|l|l|X|}
\hline
\textbf{Composant} & \textbf{Version} & \textbf{Role} \\
\hline
Ubuntu & 22.04 LTS & Systeme d'exploitation de developpement \\
\hline
Node.js & 18.x LTS & Environnement d'execution backend \\
\hline
Next.js & 14.x & Framework frontend (3 applications) \\
\hline
PostgreSQL & 15.x & Base de donnees relationnelle \\
\hline
Prisma & 5.x & ORM avec generation de types TypeScript \\
\hline
Visual Studio Code & Latest & IDE principal \\
\hline
Overleaf & Cloud & Redaction du rapport en LaTeX \\
\hline
\end{tabularx}
\end{table}

\section{Presentation des interfaces}

\subsection{Application Candidat (PWA)}

% Insere ici des captures d'ecran
% \begin{figure}[H]
%   \centering
%   \includegraphics[width=0.4\textwidth]{figures/pwa_home.png}
%   \caption{Ecran d'accueil — Liste des offres}
% \end{figure}

L'application candidat se presente comme une PWA installable sur Android.
L'ecran principal affiche la liste des offres disponibles avec un badge de
ville (Bouarada/Zaghouan), les competences requises et un score de correspondance
IA anime. [DECRIRE TES VRAIES CAPTURES ICI]

\subsection{Tableau de bord RH}

Le tableau de bord RH est base sur un Kanban drag-and-drop avec cinq colonnes :
Nouveau, En examen, Entretien programme, Accepte, Rejete. Chaque carte affiche
le nom du candidat, son numero de telephone, le score IA et l'evaluation manuelle.
[DECRIRE TES VRAIES CAPTURES ICI]

\section{Pipeline d'analyse IA}

Notre pipeline d'analyse IA fonctionne en deux phases distinctes pour eviter
de bloquer l'experience utilisateur :

\begin{figure}[H]
\centering
\begin{tikzpicture}[
  step/.style={rectangle, draw=schulteblue, fill=schulteblue!10, thick,
               minimum width=3.5cm, minimum height=0.8cm, text centered,
               font=\small},
  arr/.style={->, thick, color=schulteblue}
]
\node[step] (sub)  at (0,6)   {Soumission candidature};
\node[step] (db)   at (0,5)   {Sauvegarde en base (async)};
\node[step] (gem)  at (0,4)   {Appel Gemini (background)};
\node[step] (store1) at (0,3) {Stockage resultat partiel};
\node[step] (rh)   at (4,2)   {RH ouvre le dossier};
\node[step] (put)  at (4,1)   {Appel Puter.js (navigateur)};
\node[step] (merge)at (0,0)   {Fusion + Stockage definitif};

\draw[arr] (sub) -- (db);
\draw[arr] (db)  -- (gem);
\draw[arr] (gem) -- (store1);
\draw[arr] (rh)  -- (put);
\draw[arr] (store1) -- (merge);
\draw[arr] (put) -- (merge);
\end{tikzpicture}
\caption{Pipeline d'analyse IA double-fournisseur}
\end{figure}

\section{Tests et evaluation}

\subsection{Tests fonctionnels}

\begin{table}[H]
\centering
\caption{Cas de tests fonctionnels}
\begin{tabularx}{\textwidth}{|l|X|l|}
\hline
\textbf{Cas de test} & \textbf{Resultat attendu} & \textbf{Statut} \\
\hline
Upload PDF invalide (jpg) & Rejet avec message d'erreur & [OK/NOK] \\
\hline
Upload PDF scanne & Rejet, suggestion formulaire & [OK/NOK] \\
\hline
Numero non-tunisien & Rejet en temps reel & [OK/NOK] \\
\hline
Candidature en double & Reponse 409 & [OK/NOK] \\
\hline
Candidature offre fermee & Reponse 400 & [OK/NOK] \\
\hline
Acces route RH (token candidat) & Reponse 403 & [OK/NOK] \\
\hline
Deplacement carte Kanban & Mise a jour temps reel candidat & [OK/NOK] \\
\hline
\end{tabularx}
\end{table}

\subsection{Tableau comparatif avant/apres}

\begin{table}[H]
\centering
\caption{Valeur ajoutee de la solution}
\begin{tabularx}{\textwidth}{|X|X|X|}
\hline
\textbf{Critere} & \textbf{Avant (existant)} & \textbf{Apres (notre solution)} \\
\hline
Publication d'offres & Inexistante en Tunisie & Interface RH dediee, 2 min par offre \\
\hline
Suivi des candidatures & Email manuel & Pipeline Kanban structure \\
\hline
Notification candidat & Aucune & Temps reel via Socket.io \\
\hline
Analyse des CVs & Manuelle, subjective & IA double-fournisseur, score 0-100 \\
\hline
Langue d'interface & Allemand uniquement & Français, adapte au marche tunisien \\
\hline
Isolation des sites & Aucune & Separation stricte Bouarada/Zaghouan \\
\hline
\end{tabularx}
\end{table}

\newpage

% ════════════════════════════════════════════════════════════════
%  CONCLUSION GENERALE
% ════════════════════════════════════════════════════════════════
\chapter*{Conclusion Generale}
\addcontentsline{toc}{chapter}{Conclusion Generale}
\markboth{Conclusion Generale}{}

\section*{Bilan des contributions}
Ce projet a permis de concevoir et realiser une plateforme de recrutement
complete, adaptee aux specificites de Schulte Automotive Tunisia. Les trois
contributions principales sont :
\begin{enumerate}
  \item Le developpement d'une application web RH avec Kanban temps reel
        permettant une gestion structuree des candidatures.
  \item L'implementation d'une PWA mobile installable sur Android,
        offrant aux candidats une experience de suivi en temps reel.
  \item L'integration d'une pipeline IA double-fournisseur produisant
        des analyses argumentees et nuancees des profils candidats.
\end{enumerate}

\section*{Perspectives}
Plusieurs evolutions sont envisageables pour enrichir cette plateforme :
\begin{itemize}
  \item L'ajout d'un module OCR pour traiter les CVs scannes.
  \item Le developpement d'un tableau de bord analytique avance.
  \item La mise en place de tests automatises (tests unitaires et E2E).
  \item Le deploiement en production sur des infrastructures cloud.
\end{itemize}

\newpage

% ── BIBLIOGRAPHIE ────────────────────────────────────────────────
\printbibliography[heading=bibintoc, title={Bibliographie}]

\end{document}
```

---

## FICHIER references.bib (a creer dans Overleaf)

```bibtex
@online{nextjs2024,
  author = {{Vercel}},
  title  = {Next.js Documentation},
  year   = {2024},
  url    = {https://nextjs.org/docs},
  urldate = {2025-01-01}
}

@online{socketio2024,
  author = {{Socket.io Contributors}},
  title  = {Socket.io Documentation},
  year   = {2024},
  url    = {https://socket.io/docs},
  urldate = {2025-01-01}
}

@online{prisma2024,
  author = {{Prisma Data}},
  title  = {Prisma ORM Documentation},
  year   = {2024},
  url    = {https://www.prisma.io/docs},
  urldate = {2025-01-01}
}

@online{owasp2021,
  author = {{OWASP Foundation}},
  title  = {OWASP Top Ten 2021},
  year   = {2021},
  url    = {https://owasp.org/www-project-top-ten/},
  urldate = {2025-01-01}
}

@article{shrm2023,
  author  = {{Society for Human Resource Management}},
  title   = {Using Applicant Tracking Systems},
  journal = {SHRM Research},
  year    = {2023}
}

@online{gemini2024,
  author = {{Google DeepMind}},
  title  = {Gemini API Documentation},
  year   = {2024},
  url    = {https://ai.google.dev/docs},
  urldate = {2025-01-01}
}
```

---

## CONFIGURATION OVERLEAF

Dans Overleaf :
1. Nouveau projet → "Blank Project"
2. Colle le template LaTeX dans main.tex
3. Cree references.bib et colle le contenu BibTeX
4. Menu → Compiler : XeLaTeX ou pdfLaTeX
5. Pour minted (coloration syntaxique) : activer --shell-escape dans les parametres

---

## CE QUE TU DOIS ENCORE ECRIRE (placeholders)

Ces sections sont a toi seul — elles doivent etre dans tes propres mots
et personne ne peut les generer a ta place :

- Organigramme de l'entreprise (figure)
- Captures d'ecran de tes vraies interfaces (figures)
- Diagramme ERD de ta base de donnees (figure)
- Cas de tests avec tes vrais resultats OK/NOK
- Toute anecdote ou observation de ton stage

Ces elements personnels sont aussi ta meilleure protection contre la detection IA.
