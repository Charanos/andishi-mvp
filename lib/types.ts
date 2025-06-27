// Renamed to avoid conflict with mock data's notification type
export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface Skill {
  name: string;
  level: number;
  category?: string;
  trending?: string;
  endorsements?: number;
  lastUsed?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: string;
  timeZone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  tagline: string;
  bio?: string;
}

export interface ProfessionalInfo {
  title: string;
  experienceLevel: string;
  yearsOfExperience?: string;
  availability: string;
  hourlyRate: number;
  bio?: string;
  languages?: string[];
  certifications?: string[];
  preferredWorkType?: string[];
  workingHours?: string;
}

export interface TechnicalSkills {
  primarySkills: Skill[];
  frameworks?: Skill[];
  databases?: Skill[];
  tools?: Skill[];
  cloudPlatforms?: string[];
  specializations?: string[];
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  actualHours?: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  payment: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: "in-progress" | "completed" | "review" | "on-hold";
  startDate: string;
  deadline: string;
  budget: number;
  progress: number;
  priority: "high" | "medium" | "low" | "critical";
  client: string;
  team: string[];
  teamSize?: number;
  technologies: string[];
  riskLevel: "high" | "medium" | "low";
  satisfaction: 1 | 2 | 3 | 4 | 5;
  metrics?: {
    linesOfCode: number;
    commits: number;
    testsWritten: number;
    bugsFixed: number;
    codeReviews: number;
  };
  tasks?: ProjectTask[];
  milestones?: ProjectMilestone[];
}

export interface Stats {
  totalProjects: number;
  completedProjects?: number;
  totalEarnings: number;
  averageRating: number;
  totalCodeLines?: number;
  activeDays?: number;
  clientRetention: number;
  responseTime?: string;
  totalCommits?: number;
  bugsFixed?: number;
  codeReviewsGiven?: number;
  mentoringSessions?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: string;
  rarity: "epic" | "legendary" | "rare";
}

export interface RecentActivity {
  id: string;
  action: string;
  timestamp: string;
  type: "task" | "feedback" | "code" | "achievement";
}

export interface Notification {
    id: string;
    type: "deadline" | "project" | "achievement";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    priority: "high" | "medium" | "low";
}

export interface TimeEntry {
    date: string;
    hours: number;
    project: string;
    description: string;
}

export interface DeveloperProfile {
  id: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  technicalSkills: TechnicalSkills;
  stats: Stats;
  projects?: Project[];
  achievements?: Achievement[];
  recentActivity?: RecentActivity[];
  notifications?: Notification[];
  timeEntries?: TimeEntry[];
}
