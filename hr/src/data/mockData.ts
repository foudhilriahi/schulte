export type JobOffer = {
  id: string;
  title: string;
  city: "Bouarada" | "Zaghouan";
  contractType: "CDI" | "CDD" | "Stage";
  skills: string[];
  deadline: string;
  matchScore: number;
  description: string;
  postedDate: string;
};

export type ApplicationStatus = "applied" | "review" | "interview" | "decision";

export type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  city: "Bouarada" | "Zaghouan";
  status: ApplicationStatus;
  appliedDate: string;
  reviewDate?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  prepNotes?: string;
  decisionDate?: string;
  accepted?: boolean;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

export const mockJobs: JobOffer[] = [
  {
    id: "1",
    title: "Ingénieur Qualité",
    city: "Bouarada",
    contractType: "CDI",
    skills: ["ISO 9001", "IATF 16949", "Lean"],
    deadline: "2026-04-15",
    matchScore: 87,
    description: "Assurer la qualité des pièces automobiles.",
    postedDate: "2026-03-01",
  },
  {
    id: "2",
    title: "Technicien de Maintenance",
    city: "Zaghouan",
    contractType: "CDI",
    skills: ["Électromécanique", "Automates", "SAP"],
    deadline: "2026-04-20",
    matchScore: 72,
    description: "Maintenance préventive et corrective.",
    postedDate: "2026-03-02",
  },
  {
    id: "3",
    title: "Stagiaire Logistique",
    city: "Bouarada",
    contractType: "Stage",
    skills: ["Supply Chain", "Excel", "WMS"],
    deadline: "2026-03-30",
    matchScore: 64,
    description: "Optimisation des flux logistiques.",
    postedDate: "2026-03-03",
  },
  {
    id: "4",
    title: "Opérateur de Production",
    city: "Zaghouan",
    contractType: "CDD",
    skills: ["Assemblage", "Soudure", "5S"],
    deadline: "2026-04-10",
    matchScore: 91,
    description: "Production de composants automobiles.",
    postedDate: "2026-03-04",
  },
  {
    id: "5",
    title: "Responsable HSE",
    city: "Bouarada",
    contractType: "CDI",
    skills: ["ISO 14001", "Sécurité", "Audit"],
    deadline: "2026-04-25",
    matchScore: 55,
    description: "Gestion hygiène, sécurité, environnement.",
    postedDate: "2026-03-05",
  },
];

export const mockApplications: Application[] = [
  {
    id: "a1",
    jobId: "1",
    jobTitle: "Ingénieur Qualité",
    city: "Bouarada",
    status: "interview",
    appliedDate: "2026-02-15",
    reviewDate: "2026-02-20",
    interviewDate: "2026-03-10",
    interviewTime: "09:30",
    interviewLocation: "Usine Bouarada, Salle de conférence B2",
    prepNotes: "Préparer une présentation sur votre expérience en IATF 16949. Apporter vos certifications.",
  },
  {
    id: "a2",
    jobId: "4",
    jobTitle: "Opérateur de Production",
    city: "Zaghouan",
    status: "review",
    appliedDate: "2026-03-01",
    reviewDate: "2026-03-05",
  },
  {
    id: "a3",
    jobId: "3",
    jobTitle: "Stagiaire Logistique",
    city: "Bouarada",
    status: "applied",
    appliedDate: "2026-03-04",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Entretien programmé",
    message: "Votre entretien pour Ingénieur Qualité est le 10 mars à 09:30.",
    date: "2026-03-06",
    read: false,
    type: "info",
  },
  {
    id: "n2",
    title: "Candidature en cours d'examen",
    message: "Votre candidature pour Opérateur de Production est en cours d'examen.",
    date: "2026-03-05",
    read: false,
    type: "info",
  },
  {
    id: "n3",
    title: "Nouvelle offre disponible",
    message: "Un poste de Responsable HSE est disponible à Bouarada.",
    date: "2026-03-05",
    read: true,
    type: "success",
  },
];
