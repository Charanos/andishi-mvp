export interface ProjectMetrics {
  linesOfCode: number;
  commits: number;
  testsWritten: number;
  bugsFixed: number;
  codeReviews: number;
}

export interface ProjectAssignment {
  id: string;
  title: string;
  description: string;
  status: "assigned" | "in-progress" | "completed" | "on-hold" | "review";
  startDate: string;
  deadline: string;
  budget: number;
  technologies: string[];
  progress: number;
  priority: "low" | "medium" | "high" | "critical";
  client: string;
  teamSize: number;
  metrics: ProjectMetrics;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
    estimatedHours: number;
    actualHours?: number;
  }[];
  milestones: {
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
    payment: number;
  }[];
  riskLevel: "low" | "medium" | "high";
  satisfaction: number;
  category: string;
  isBookmarked: boolean;
  lastUpdated: string;
  estimatedCompletion: string;
  actualHours: number;
  efficiency: number;
}

export interface Assignment {
  id: string;
  projectId: string;
  developerId: string;
  role: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  assignedAt: string;
  updatedAt: string;
}

export interface Developer {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
  };
  professionalInfo: {
    title: string;
    experienceLevel: string;
    availability: string;
    hourlyRate: number;
  };
  technicalSkills: {
    primarySkills: string[];
    frameworks: string[];
    specializations: string[];
  };
  stats: {
    totalProjects: number;
    averageRating: number;
    clientRetention: number;
  };
  currentProjects?: number;
  isAvailable?: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  techStack: string[];
  experienceLevel: string;
  // ...other fields
}
