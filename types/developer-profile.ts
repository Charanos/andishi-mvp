export interface Skill {
  name: string;
  level: number;
  endorsements?: number;
  lastUsed?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  portfolio?: string;
  bio: string;
}

export interface ProfessionalInfo {
  title: string;
  experienceLevel: string;
  availability: string;
  hourlyRate: number;
}

export interface TechnicalSkills {
  primarySkills: Skill[];
}

export interface Stats {
  totalProjects: number;
  averageRating: number;
  totalEarnings: number;
  clientRetention: number;
}

export interface DeveloperProfile {
  id: string;
  user: any;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  technicalSkills: TechnicalSkills;
  stats: Stats;
  projects: any[];
  recentActivity: any[];
  achievements: any[];
  notifications: any[];
  timeEntries: any[];
}
