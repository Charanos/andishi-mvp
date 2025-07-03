// types.ts
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  timeZone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  profilePicture: string;
}

export interface ProfessionalInfo {
  title: string;
  experienceLevel: string;
  yearsOfExperience: string;
  currentRole: string;
  currentCompany: string;
  availability: string;
  workType: string[];
  languages: string[];
  bio: string;
}

export interface TechnicalSkills {
  primarySkills: string[];
  secondarySkills: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  certifications: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  role: string;
}

export interface RatesAndPreferences {
  currency: string;
  workingHours: string;
  communicationPreferences: string[];
}

export interface DeveloperData {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  technicalSkills: TechnicalSkills;
  workExperience: WorkExperience[];
  projects: Project[];
  ratesAndPreferences: RatesAndPreferences;
}

