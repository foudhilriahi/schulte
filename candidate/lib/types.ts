export type Site = 'Bouarada' | 'Zaghouan';
export type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Alternance';
export type OfferStatus = 'open' | 'paused' | 'closed';
export type ApplicationStatus = 'new' | 'reviewing' | 'interview' | 'accepted' | 'rejected';

export interface JobOffer {
  id: string;
  title: string;
  site: Site;
  contractType: ContractType;
  department: string;
  seats: number;
  description: string;
  requiredSkills: string[];
  experienceYears: number;
  salaryRange?: string;
  showSalary: boolean;
  status: OfferStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  _count?: {
    applications: number;
  };
  stats?: {
    totalApplications: number;
    applicationsWithAI: number;
    averageAIScore: number | null;
    statusBreakdown: {
      reviewing: number;
      interview: number;
      accepted: number;
      rejected: number;
    };
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: string;
  notes?: string;
  prepNotes: string[];
}

export interface Application {
  id: string;
  candidateId: string;
  offerId: string;
  status: ApplicationStatus;
  cvUrl?: string;
  cvText?: string;
  formData?: any;
  aiScore?: number;
  aiAnalysis?: string;
  hrNotes?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
  offer?: JobOffer;
  interview?: Interview;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CANDIDATE';
  site?: string;
  experience?: string;
  skills: string[];
  cvUrl?: string;
}
