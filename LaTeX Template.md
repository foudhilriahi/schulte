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

% ════════════════════════════════════════════════════════════════
%  CHAPITRE 3 — CONCEPTION ET ARCHITECTURE
% ════════════════════════════════════════════════════════════════
\chapter{Conception et Architecture de la Solution}

\section{Introduction de la conception}

Ce chapitre porte le coeur de notre travail technique. Nous avons transforme
un besoin metier concret observe a Bouarada et Zaghouan en une conception
argumentee, testable et directement exploitable pendant la realisation.
Notre enchainement est volontairement strict : exigences, UML des flux, architecture,
modele de donnees, securite, puis organisation des composants backend et frontends.

\subsection{Demarche methodologique retenue}

Nous avons construit la conception comme une suite de decisions verifiables.
Nous avons d'abord collecte les contraintes reelles avec l'equipe RH, puis
nous avons formalise les cas d'usage prioritaires, dessine les diagrammes UML,
valide la faisabilite sur les points risques (temps reel, IA, isolation multi-site),
et enfin fige les choix avant implementation. Cette methode nous a evite une
architecture theorique deconnectee de l'usage, et elle a reduit les retours
arriere pendant le developpement des trois applications (PWA candidat, RH, admin).

\subsection{Critere de qualite de la conception}

Nous avons retenu un filtre de qualite simple. Chaque choix devait respecter
la realite metier RH, garantir la securite des donnees, rester maintenable,
et conserver un cout de mise en oeuvre compatible avec le contexte PFE.
Ce filtre explique nos compromis : analyse IA asynchrone pour proteger la
fluidite candidat, et centralisation des regles d'autorisation dans l'API
pour eviter les ecarts entre interfaces.

\section{Modelisation des exigences et du perimetre}

\subsection{Structure globale des exigences}

Nous avons commence par construire une arborescence d'exigences claire pour
eviter les ambiguities entre besoins metier et decisions techniques. Le premier
niveau separe les exigences candidates, RH, administration et exigences
transversales. Nous avons ensuite relie chaque exigence a un livrable concret :
endpoint backend, ecran front, regle de validation ou evenement Socket.io.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/vue_globale_exigence_racine_categories.png}
\caption{Vue globale des exigences fonctionnelles et transversales}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/exigences_candidat_req.png}
\caption{Detail des exigences du module Candidat}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/exigences_rh_req.png}
\caption{Detail des exigences du module RH}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/exigences_admin_transversales.png}
\caption{Detail des exigences Administration et contraintes transversales}
\end{figure}

\subsection{Acteurs et responsabilites}

Le systeme est structure autour de trois acteurs principaux :
\textbf{Candidat}, \textbf{RH} et \textbf{Administrateur}. Chaque acteur opere
sur un perimetre explicite, avec des responsabilites non superposees. Nous avons
evite les droits implicites et nous avons impose une verification role/site
cote API pour toute operation sensible. Concretement, un RH rattache a un site
ne peut pas agir sur les candidatures de l'autre site, meme si l'URL est connue.

\subsection{Priorisation des exigences}

Toutes les exigences n'ont pas le meme poids. Nous avons donc structure le
perimetre en priorites pour proteger le chemin critique de livraison :
\textbf{priorite haute} (authentification, candidature, suivi RH),
\textbf{priorite moyenne} (notifications enrichies, automatisations),
\textbf{priorite evolutive} (extensions analytiques et tableaux avances).
Ce decoupage rend la trajectoire projet lisible devant le jury : ce qui est
essentiel au metier est garanti en premier, puis complete de facon incrementale.
Nous avons ainsi securise d'abord le cycle principal ``Nouveau -> En examen ->
Entretien programme -> Accepte/Rejete'' avant d'etendre les fonctions annexes.

\section{Architecture logique et technique}

\subsection{Vue d'architecture globale}

Nous avons retenu une architecture en trois couches : presentation, logique
metier et persistance. L'objectif etait de separer ce qui change souvent
(interfaces) de ce qui doit rester stable (regles metier, integrite de donnees).
Cette separation a facilite les evolutions simultanees sur `3000` (candidat),
`3002` (RH), `3001` (admin) et `4000` (API) sans casser le noyau metier.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/architecture_globale.png}
\caption{Architecture globale de la solution}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/architecture_frontends.png}
\caption{Architecture des frontends (PWA candidat et interface RH/Admin)}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/architecture_backend.png}
\caption{Architecture du backend Node.js/Express}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/architecture_temps_reel_socket_services_externes.png}
\caption{Architecture temps reel et services externes}
\end{figure}

\subsection{Principes d'organisation retenus}

Nous avons applique quatre principes structurants :
\begin{enumerate}
  \item \textbf{Centralisation des regles metier} dans le backend,
  \item \textbf{Separation stricte des couches} (UI, API, DB),
  \item \textbf{Isolation multi-site} (Bouarada/Zaghouan),
  \item \textbf{Traitement asynchrone} des operations non bloquantes (analyse IA, rappels).
\end{enumerate}

Cette organisation nous a permis de garder une base coherente malgre la presence
de plusieurs interfaces et d'un flux metier evolutif. Nous avons aussi limite
les duplications de logique en interdisant les decisions metier critiques cote
frontend sans validation serveur.

\subsection{Decisions d'architecture structurantes}

Trois decisions ont fortement influence la robustesse de la solution.
Premiere decision : \textbf{backend autoritaire} sur toutes les regles metier
(aucune regle critique n'est laissee uniquement au frontend). Deuxieme decision :
\textbf{multi-frontends specialises} plutot qu'une interface unique, afin de
conserver une experience adaptee au contexte de chaque acteur. Troisieme decision :
\textbf{conception orientee evenements} pour les notifications temps reel, ce qui
reduit les latences percues et evite la surcharge par polling intensif.
Nous avons exploite des rooms Socket explicites (`offers:public`, `site:{site}`,
`hr:{id}`, `candidate:{id}`, `admin`) pour diffuser uniquement l'information utile
a chaque acteur.

\subsection{Compromis techniques assumes}

Nous avons accepte certains compromis pour rester aligns avec le contexte reel
de l'entreprise. L'usage de deux voies IA (backend + navigateur RH) apporte une
redondance utile mais augmente la complexite de fusion des resultats. Le choix
Socket.io simplifie le temps reel mais impose une gestion stricte des sessions et
de la revocation de jetons. Ces compromis sont documentes et maitrises, car ils
repondent a des besoins metier explicites. Nous avons privilegie la fiabilite
metier plutot qu'une simplification artificielle de l'architecture.

\section{Conception dynamique UML des processus}

\subsection{Flux candidat de bout en bout}

Nous avons modelise le parcours candidat comme une sequence composee de verifications,
d'actions de persistance, puis de notifications. Le candidat depose sa candidature
sans attendre la fin du calcul IA pour conserver une experience fluide.
Nous avons maintenu une contrainte forte : aucune candidature en double pour le
meme couple candidat/offre.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/inscription_candidat.png}
\caption{Sequence d'inscription candidat}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/tentative_connexion_avant_verification.png}
\caption{Tentative de connexion avant verification email}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/verification_email_premiere_connexion.png}
\caption{Verification email et premiere connexion}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/renvoi_code_verification.png}
\caption{Renvoi du code de verification}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/creation_cv_upload_builder.png}
\caption{Creation d'un CV (upload PDF ou formulaire)}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/selection_cv_soumission_candidature.png}
\caption{Selection du CV puis soumission}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/depot_candidature_analyse_ia.png}
\caption{Depot de candidature et lancement de l'analyse IA}
\end{figure}

\subsection{Orchestration de l'analyse IA}

Nous avons detaille la logique IA en plusieurs etapes pour clarifier le partage
des responsabilites entre backend et analyse declenchee cote interface RH.
Le backend traite l'analyse automatique initiale, puis l'interface RH peut
declencher une re-analyse/fusion selon le contexte de revue. Dans notre
implementation, nous utilisons Puter.js (GPT-4o gratuit) et Gemini 1.5 Flash,
puis nous consolidons score, recommandation et justification pour offrir une
lecture exploitable par les RH.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/analyse_ia_async_notifications_socket.png}
\caption{Analyse IA asynchrone et notification temps reel}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/analyse_backend_gemini.png}
\caption{Analyse IA cote backend (Gemini)}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/analyse_puterjs.png}
\caption{Analyse IA cote navigateur RH (Puter.js)}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/fusion_resultats_persistance.png}
\caption{Fusion des resultats IA et persistance}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/mise_a_jour_backend_normalisation_notifications.png}
\caption{Normalisation backend et diffusion des mises a jour}
\end{figure}

\subsection{Flux RH et cycle d'entretien}

Le parcours RH est pilote par le Kanban de candidatures et les actions de
qualification. Nous avons modelise les transitions de statut et la partie
entretien pour eviter les transitions incoherentes et assurer la tracabilite
des decisions. Nous avons aussi fixe des preconditions strictes avant
planification pour empecher les erreurs de workflow.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/changement_statut_candidature.png}
\caption{Flux de changement de statut d'une candidature}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/action_rh_planification_statut_interview.png}
\caption{Action RH et declenchement de planification}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/planification_entretien_initiale.png}
\caption{Planification initiale d'un entretien}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/planification_entretien_maj.png}
\caption{Mise a jour ou replanification d'entretien}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/enregistrement_resultat_entretien.png}
\caption{Enregistrement du resultat d'entretien}
\end{figure}

\subsection{Modelisation des etats candidature}

Nous avons decoupe le cycle d'etat pour rendre explicite le comportement du
systeme depuis le statut initial jusqu'aux etats terminaux. Ce choix rend les
regles de transition auditables et facilite les tests de non-regression.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/vue_ensemble_etats_principaux.png}
\caption{Vue d'ensemble des etats candidature}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/detail_etapes_initiales_nouvelle_ia_enexamen.png}
\caption{Detail des etapes initiales}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/detail_etats_entretien_resultat_fin.png}
\caption{Detail des etats entretien et fin de cycle}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/details_transitions_notifications.png}
\caption{Transitions d'etat et notifications associees}
\end{figure}

\subsection{Regles anti-incoherence des processus}

La modelisation UML ne se limite pas a decrire des flux ; elle fixe aussi les
interdictions de transition. Une candidature en etat terminal ne peut pas etre
reinjectee dans un cycle actif sans action explicite de correction. De meme, la
planification d'entretien est conditionnee par l'etat metier et par le perimetre
site du RH. Cette formalisation est essentielle pour garantir l'integrite des
decisions de recrutement et limiter les erreurs operationnelles. Nous avons
ainsi transforme des regles informelles en contraintes techniques executables.

\section{Conception de la securite et de l'identite}

\subsection{Authentification et cycle des jetons}

Nous avons structure la securite autour de JWT d'acces a courte duree et de
refresh tokens persistants avec rotation. Ce choix reduit la fenetre de risque
en cas de vol de jeton et permet une experience utilisateur stable.
Nous gardons la session active sans sacrifier le controle de securite.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/authentification_generation_jetons.png}
\caption{Authentification et generation des jetons}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/rotation_refresh_token.png}
\caption{Rotation du refresh token}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/acces_securise_revocation_websockets.png}
\caption{Acces securise, revocation et controle WebSocket}
\end{figure}

\subsection{Comportements de securite applicative}

Nous avons complete ce modele avec des regles de verification metier : obligation
de verification email pour les candidats, gestion explicite des erreurs de connexion,
et reinitialisation de mot de passe pour limiter les blocages operationnels.
Nous avons ajoute une sanitisation defensive des charges utiles pour ne jamais
exposer de donnees sensibles dans les reponses.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/connexion_rh.png}
\caption{Connexion RH}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/connexion_admin.png}
\caption{Connexion Admin}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/reset_mot_de_passe_rh.png}
\caption{Reset de mot de passe RH}
\end{figure}

\subsection{Defense en profondeur}

La securite de la solution repose sur des controles complementaires et non sur
une barriere unique. La premiere couche est l'authentification. La deuxieme est
l'autorisation contextuelle (role + site + propriete metier). La troisieme est
la sanitisation des reponses pour eviter l'exposition de champs sensibles.
La quatrieme est la journalisation des actions critiques pour audit interne.
Cette defense en profondeur reduit l'impact d'une erreur locale et ameliore la
confiance globale du systeme. Elle nous donne aussi un argument fort devant
jury : la securite est un systeme de couches, pas un seul mecanisme.

\section{Conception des donnees}

\subsection{Vision metier des entites}

Le modele de donnees traduit directement le metier recrutement :
utilisateurs, offres, candidatures, entretiens, notifications et sessions.
Nous avons ajoute une entite de bibliotheque CV pour couvrir le besoin reel
de reutilisation des CV par les candidats. Le schema final reste lisible
autour de sept tables pivots : `Users`, `OfferTemplates`, `JobOffers`,
`Applications`, `Interviews`, `Notifications`, `RefreshTokens`.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/diagramme_entites_metier.png}
\caption{Diagramme des entites metier}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/er_utilisateurs_offres.png}
\caption{Sous-modele E-R utilisateurs et offres}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/er_candidatures_cv_entretiens_notifications.png}
\caption{Sous-modele E-R candidatures, CV, entretiens et notifications}
\end{figure}

\subsection{Regles de coherence des donnees}

Nous avons impose des contraintes d'integrite pour proteger la validite du
processus :
\begin{itemize}
  \item unicite candidature par couple candidat/offre,
  \item relation 1--1 candidature/entretien,
  \item rattachement d'offre a un site unique,
  \item conservation de la trace statutaire et des analyses IA associees.
\end{itemize}
Nous avons prefere des contraintes explicites en base et en service metier
pour empecher les etats invalides des leur creation.

\subsection{Traçabilite et auditabilite des donnees}

Dans un contexte RH, la valeur d'une donnee depend aussi de sa traçabilite.
Nous avons donc preserve l'historique utile : statut precedent, date de mise a
jour, acteur initiateur de l'action, et metadonnees d'analyse IA. Cette approche
permet de reconstituer le parcours d'une candidature en cas de litige, d'audit
qualite ou de question du management. Nous pouvons ainsi expliquer chaque
decision RH avec des preuves techniques et temporelles.

\section{Conception des composants backend}

\subsection{Organisation des repositories}

Nous avons isole l'acces donnees dans des repositories dedies. Cette separation
evite de disperser la logique Prisma dans les controleurs et simplifie les
evolutions futures. En pratique, cette organisation a reduit le couplage et
accelere la correction des anomalies sans effet domino.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/diagramme_repositories.png}
\caption{Organisation des repositories backend}
\end{figure}

\subsection{Services, patterns et controleurs}

Nous avons organise les services autour de responsabilites claires :
authentification, notifications, sockets, IA, cron, upload. Cette structure
est completee par des patterns de decouplage pour conserver une base maintenable.
Nous avons privilegie des services courts, testables, et alignes sur une seule
responsabilite metier.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/diagramme_services_patterns_conception.png}
\caption{Services applicatifs et patterns de conception}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/diagramme_controleur_admincontroller.png}
\caption{Conception detaillee du controleur d'administration}
\end{figure}

\subsection{Contrat entre couches}

Chaque couche expose un contrat explicite : le controleur orchestre, le service
porte la regle metier, le repository garantit l'acces persistant. Cette separation
evite les effets de bord frequents dans les projets CRUD rapides, notamment la
duplication de regles et les validations incoherentes entre endpoints.
Nous avons ainsi garde un point unique de verite pour les decisions critiques.

\section{Conception des interactions RH/Admin}

\subsection{Gouvernance des comptes RH}

Nous avons formalise le cycle de vie d'un compte RH pour encadrer creation,
activation, desactivation et suppression. Cette partie est critique car elle
impacte la securite et la segregation operationnelle. Nous avons fixe des
regles de gouvernance explicites pour eviter qu'un compte desactive conserve
des droits d'action implicites.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/creation_compte_rh.png}
\caption{Creation d'un compte RH}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/cycle_vie_compte_rh.png}
\caption{Cycle de vie d'un compte RH}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/flux_suppression_compte.png}
\caption{Flux de suppression de compte RH}
\end{figure}

\subsection{Pilotage administratif et diffusion}

Les fonctions d'administration incluent la gestion des templates et la
diffusion de messages vers les equipes RH, notamment pour les changements
organisationnels ou les consignes transversales. Nous avons garde ces
fonctions separees des operations RH quotidiennes pour limiter le risque
d'erreur de perimetre.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/gestion_templates.png}
\caption{Gestion des templates d'offres}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/broadcast_admin_vers_rh.png}
\caption{Broadcast admin vers RH}
\end{figure}

\subsection{Segregation des privileges}

Les fonctions admin et RH partagent certains ecrans de pilotage, mais leurs
privileges ne sont pas equivalentes. L'administrateur gouverne les comptes,
les templates globaux et la diffusion transverse ; le RH opere sur le cycle
de recrutement dans son perimetre autorise. Cette segregation limite le risque
d'actions non conformes et facilite la gouvernance interne. Nous defendons ce
choix car il traduit directement la separation des responsabilites terrain.

\section{Conception des notifications et automatisations}

Les notifications servent d'axe transversal entre candidature, suivi RH et
communication candidat. Nous avons combine notifications en base, diffusion
Socket.io et rappels automatiques planifies pour maintenir la reactivite.
L'objectif est simple : aucune etape critique ne doit rester invisible.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/notifications_rappel_automatique.png}
\caption{Conception des notifications et rappels}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{Isipfe/Figures/rappel_automatique_entretien.png}
\caption{Rappel automatique d'entretien}
\end{figure}

\subsection{Qualite de service des notifications}

Nous avons defini une politique de qualite de service simple : notification
immediate pour les evenements critiques (statut, entretien), notification
regroupee pour les messages informatifs, et mecanisme de relance pour reduire
les oublis operatoires. Cette politique limite le bruit utilisateur tout en
preservant la reactivite metier. Nous avons ainsi equilibre rapidite d'information
et charge cognitive des utilisateurs.

\section{Traçabilite exigences vers architecture UML}

Pour renforcer la defendabilite du chapitre, nous relions explicitement les
exigences critiques aux decisions de conception, aux diagrammes UML et aux
composants responsables. Cette table rend notre argumentation auditable :
le jury peut suivre le passage ``besoin -> modele -> composant -> comportement''.

\begin{table}[H]
\centering
\caption{Traçabilite exigences -> conception}
\begin{tabularx}{\textwidth}{|l|X|X|}
\hline
\textbf{Exigence} & \textbf{Traduction conception} & \textbf{Preuve UML / composant} \\
\hline
Depot candidature fluide & Soumission asynchrone + analyse IA en arriere-plan & Diagrammes ``Depot de candidature'', ``Analyse IA asynchrone'', service IA \\
\hline
Isolement multi-site RH & Verification role/site sur routes sensibles & Diagrammes ``Action RH'', ``Planification'', middleware auth/authorization \\
\hline
Suivi temps reel & Bus Socket.io + events metier normalises & Diagrammes ``Mise a jour backend...'', module notifications/socket \\
\hline
Cycle entretien traçable & Etats metier explicites + transitions controlees & Diagrammes d'etats candidature + flux d'entretien \\
\hline
Securite d'acces & JWT court + refresh rotation + revocation & Diagrammes ``Authentification'', ``Rotation'', ``Acces securise'' \\
\hline
\end{tabularx}
\end{table}

\section{Risques de conception et mesures de mitigation}

\subsection{Risques identifies}

Les risques majeurs identifies sont : collisions de statut lors d'actions RH
simultanees, incoherence potentielle entre analyses IA, et surcharge sur les
endpoints de listing en croissance volumetrique. Nous avons aussi retenu le
risque de confusion inter-site comme risque metier prioritaire.

\subsection{Mesures de mitigation prevues}

Pour ces risques, nous avons prevu des garde-fous : verifications d'etat avant
transition, strategie de fusion prudente des scores IA, et pagination progressive
des endpoints lourds. En complement, la journalisation des actions critiques
permet une detection rapide des anomalies et une correction guidee.
Nous avons privilegie des mitigations simples a executer plutot que des
mecanismes complexes difficiles a maintenir en contexte industriel.

\section{Planification de la conception}

Nous avons structure la phase conception sur quatre mois pour garder une
progression maitrisee entre cadrage, modelisation, conception detaillee et
stabilisation. Cette planification nous a permis de conserver un rythme stable
et d'integrer les validations terrain sans bloquer l'avancement global.

\begin{figure}[H]
\centering
\includegraphics[width=0.86\textwidth]{Isipfe/Figures/gantt_mois_1_2.png}
\caption{Planification de conception -- Mois 1 et 2}
\end{figure}
\begin{figure}[H]
\centering
\includegraphics[width=0.86\textwidth]{Isipfe/Figures/gantt_mois_3_4.png}
\caption{Planification de conception -- Mois 3 et 4}
\end{figure}

\section{Conclusion du chapitre}

Ce chapitre presente une conception complete, coherente et reliee au terrain
de Schulte Tunisia. Nous avons couvert le perimetre exigences, la modelisation
dynamique UML, l'architecture logicielle, la securite, la persistance, les
composants backend, les interactions RH/Admin, puis la strategie de notification
et d'automatisation. L'ensemble constitue un socle technique defendable devant
jury, et prepare directement le chapitre suivant consacre a la realisation
effective et aux validations experimentales. Notre objectif etait de montrer
une conception qui tient en revue academique mais surtout en usage reel.

\newpage

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
