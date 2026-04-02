export type KanbanStatus = "new" | "review" | "interview" | "accepted" | "rejected";

export type Candidate = {
  id: string;
  name: string;
  phone: string;
  email: string;
  appliedDate: string;
  jobTitle: string;
  contractType: "CDI" | "CDD" | "Stage";
  city: "Bouarada" | "Zaghouan";
  aiScore: number;
  starRating: number;
  status: KanbanStatus;
  resumeUrl?: string;
  skills: string[];
  experience: string;
  education: string;
  notes: string;
};

export type HRUser = {
  name: string;
  site: "Bouarada" | "Zaghouan";
  role: string;
  avatar?: string;
};

export type JobOffer = {
  id: string;
  title: string;
  city: "Bouarada" | "Zaghouan";
  contractType: "CDI" | "CDD" | "Stage";
  department: string;
  openPositions: number;
  applicants: number;
  deadline: string;
  postedDate: string;
  status: "active" | "closed" | "draft";
};

export type Interview = {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  location: string;
  type: "on-site" | "video" | "phone";
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
};

export const currentHR: HRUser = {
  name: "Sonia Ben Ali",
  site: "Bouarada",
  role: "Responsable RH",
};

export const mockCandidates: Candidate[] = [
  {
    id: "c1",
    name: "Ahmed Trabelsi",
    phone: "+216 98 123 456",
    email: "ahmed.trabelsi@email.com",
    appliedDate: "2026-03-01",
    jobTitle: "Ingénieur Qualité",
    contractType: "CDI",
    city: "Bouarada",
    aiScore: 92,
    starRating: 4,
    status: "interview",
    skills: ["ISO 9001", "IATF 16949", "Lean", "Six Sigma"],
    experience: "5 ans en tant qu'ingénieur qualité dans l'industrie automobile chez Valeo Tunisie.",
    education: "Diplôme d'ingénieur en Génie Industriel - ENIT",
    notes: "Excellent profil, très bonne connaissance des normes automobiles.",
  },
  {
    id: "c2",
    name: "Fatma Gharbi",
    phone: "+216 55 987 654",
    email: "fatma.gharbi@email.com",
    appliedDate: "2026-03-02",
    jobTitle: "Ingénieur Qualité",
    contractType: "CDI",
    city: "Bouarada",
    aiScore: 87,
    starRating: 5,
    status: "review",
    skills: ["ISO 9001", "Audit", "AMDEC"],
    experience: "3 ans d'expérience en contrôle qualité chez Yazaki.",
    education: "Master en Management de la Qualité - ISG Tunis",
    notes: "Profil prometteur, recommandée par un collaborateur.",
  },
  {
    id: "c3",
    name: "Mohamed Bouazizi",
    phone: "+216 22 456 789",
    email: "m.bouazizi@email.com",
    appliedDate: "2026-03-03",
    jobTitle: "Technicien de Maintenance",
    contractType: "CDI",
    city: "Zaghouan",
    aiScore: 78,
    starRating: 3,
    status: "new",
    skills: ["Électromécanique", "Automates Siemens", "SAP PM"],
    experience: "7 ans de maintenance industrielle chez Leoni.",
    education: "BTS en Maintenance Industrielle",
    notes: "",
  },
  {
    id: "c4",
    name: "Ines Saidi",
    phone: "+216 97 111 222",
    email: "ines.saidi@email.com",
    appliedDate: "2026-02-28",
    jobTitle: "Stagiaire Logistique",
    contractType: "Stage",
    city: "Bouarada",
    aiScore: 64,
    starRating: 3,
    status: "new",
    skills: ["Supply Chain", "Excel", "SAP"],
    experience: "Stage de 3 mois chez Coficab.",
    education: "Licence en Gestion Logistique - IHEC Carthage",
    notes: "Candidate pour stage PFE.",
  },
  {
    id: "c5",
    name: "Karim Hammami",
    phone: "+216 50 333 444",
    email: "karim.h@email.com",
    appliedDate: "2026-03-04",
    jobTitle: "Opérateur de Production",
    contractType: "CDD",
    city: "Zaghouan",
    aiScore: 71,
    starRating: 2,
    status: "new",
    skills: ["Assemblage", "Soudure MIG", "5S"],
    experience: "2 ans opérateur chez Hutchinson.",
    education: "CAP en Soudure Industrielle",
    notes: "",
  },
  {
    id: "c6",
    name: "Salma Khelifi",
    phone: "+216 23 555 666",
    email: "salma.k@email.com",
    appliedDate: "2026-02-25",
    jobTitle: "Responsable HSE",
    contractType: "CDI",
    city: "Bouarada",
    aiScore: 85,
    starRating: 4,
    status: "accepted",
    skills: ["ISO 14001", "ISO 45001", "Audit HSE"],
    experience: "8 ans en HSE dans le secteur automobile.",
    education: "Ingénieur en Environnement - ENIG",
    notes: "Offre envoyée, en attente de réponse.",
  },
  {
    id: "c7",
    name: "Yassine Manai",
    phone: "+216 92 777 888",
    email: "yassine.m@email.com",
    appliedDate: "2026-03-01",
    jobTitle: "Technicien de Maintenance",
    contractType: "CDI",
    city: "Zaghouan",
    aiScore: 45,
    starRating: 1,
    status: "rejected",
    skills: ["Électricité", "Mécanique"],
    experience: "1 an d'expérience générale.",
    education: "Bac Technique",
    notes: "Profil ne correspond pas aux exigences du poste.",
  },
  {
    id: "c8",
    name: "Nour Ayari",
    phone: "+216 58 999 000",
    email: "nour.ayari@email.com",
    appliedDate: "2026-03-05",
    jobTitle: "Ingénieur Qualité",
    contractType: "CDI",
    city: "Bouarada",
    aiScore: 81,
    starRating: 0,
    status: "new",
    skills: ["Métrologie", "SPC", "Core Tools"],
    experience: "4 ans chez Dräxlmaier Tunisie.",
    education: "Ingénieur en Génie Mécanique - ENIS",
    notes: "",
  },
];

export const mockOffers: JobOffer[] = [
  {
    id: "o1",
    title: "Ingénieur Qualité",
    city: "Bouarada",
    contractType: "CDI",
    department: "Qualité",
    openPositions: 2,
    applicants: 4,
    deadline: "2026-04-15",
    postedDate: "2026-03-01",
    status: "active",
  },
  {
    id: "o2",
    title: "Technicien de Maintenance",
    city: "Zaghouan",
    contractType: "CDI",
    department: "Maintenance",
    openPositions: 1,
    applicants: 2,
    deadline: "2026-04-20",
    postedDate: "2026-03-02",
    status: "active",
  },
  {
    id: "o3",
    title: "Stagiaire Logistique",
    city: "Bouarada",
    contractType: "Stage",
    department: "Supply Chain",
    openPositions: 1,
    applicants: 1,
    deadline: "2026-03-30",
    postedDate: "2026-03-03",
    status: "active",
  },
  {
    id: "o4",
    title: "Opérateur de Production",
    city: "Zaghouan",
    contractType: "CDD",
    department: "Production",
    openPositions: 3,
    applicants: 1,
    deadline: "2026-04-10",
    postedDate: "2026-03-04",
    status: "active",
  },
  {
    id: "o5",
    title: "Responsable HSE",
    city: "Bouarada",
    contractType: "CDI",
    department: "HSE",
    openPositions: 1,
    applicants: 1,
    deadline: "2026-04-25",
    postedDate: "2026-03-05",
    status: "closed",
  },
];

export const mockInterviews: Interview[] = [
  {
    id: "i1",
    candidateId: "c1",
    candidateName: "Ahmed Trabelsi",
    jobTitle: "Ingénieur Qualité",
    date: "2026-03-10",
    time: "09:30",
    location: "Usine Bouarada, Salle B2",
    type: "on-site",
    status: "scheduled",
    notes: "Préparer test technique IATF",
  },
  {
    id: "i2",
    candidateId: "c6",
    candidateName: "Salma Khelifi",
    jobTitle: "Responsable HSE",
    date: "2026-03-08",
    time: "14:00",
    location: "Visioconférence - Teams",
    type: "video",
    status: "completed",
    notes: "Entretien final avec le directeur d'usine",
  },
];

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string }[] = [
  { id: "new", label: "Nouvelles" },
  { id: "review", label: "En examen" },
  { id: "interview", label: "Entretien" },
  { id: "accepted", label: "Acceptées" },
  { id: "rejected", label: "Rejetées" },
];

export const dashboardStats = {
  totalApplications: 8,
  activeOffers: 4,
  interviewsThisWeek: 1,
  hiredThisMonth: 1,
  pendingReview: 2,
};
