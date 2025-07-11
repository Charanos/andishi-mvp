

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
  milestones: Milestone[];
  riskLevel: "low" | "medium" | "high";
  satisfaction: number;
  category: string;
  isBookmarked: boolean;
  lastUpdated: string;
  estimatedCompletion: string;
  actualHours: number;
  efficiency: number;
}



export type MilestoneStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  status: MilestoneStatus;
  dueDate?: Date;
  completedAt?: Date;
  submittedBy?: "client" | "admin";
  order: number;
  deliverables?: string[];
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

export interface ProjectDetails {
  title: string;
  description: string;
  category: string;
  techStack: string[];
  requirements?: string;
  timeline: string;
  priority: "low" | "medium" | "high" | "critical";
}



export interface PricingOption {
  type: "fixed" | "milestone" | "hourly";
  currency: "USD" | "KES";
  fixedBudget?: string;
  hourlyRate?: string;
  estimatedHours?: number;
  milestones?: Milestone[];
  totalPaid?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: "pending" | "paid" | "overdue" | "partial";
  currency?: "USD" | "KES";
  description?: string;
  notes?: string;
  invoiceUrl?: string;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  fileSize?: number;
  fileType?: "document" | "image" | "video" | "other";
  uploadedBy?: string;
  description?: string;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  type: "general" | "milestone" | "payment" | "file" | "admin_response";
  createdAt: Date;
  author: string;
  isAdminResponse?: boolean;
  parentUpdateId?: string;
}

export interface ProjectData {
  _id: string;
  projectDetails: ProjectDetails;
  pricing: PricingOption;
  status: "pending" | "in-progress" | "completed" | "on_hold" | "cancelled" | "rejected" | "reviewed";
  progress: number;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  milestones?: Milestone[];
  payments?: Payment[];
  files?: ProjectFile[];
  updates?: ProjectUpdate[];
  priority: "low" | "medium" | "high" | "critical";
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  techStack: string[];
  experienceLevel: string;
  // ...other fields
}