export interface Skill {
  name: string;
  level: number;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  portfolio?: string;
  tagline: string;
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
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  technicalSkills: TechnicalSkills;
  stats: Stats;
  projects: any[]; // You might want to type this more specifically
  recentActivity: any[]; // You might want to type this more specifically
}
