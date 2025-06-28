export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

export interface ProjectDetails {
  title: string;
  description: string;
  category: string;
  timeline: string;
  priority: "low" | "medium" | "high" | "urgent";
  techStack: string[];
  requirements: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: Date;
  completedAt?: Date;
  order: number;
}

export interface PricingOption {
  type: "fixed" | "milestone" | "hourly";
  currency: "USD" | "KES";
  fixedBudget?: string;
  milestones?: Milestone[];
  hourlyRate?: string;
  estimatedHours?: string;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: Date;
}

export interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

export interface ProjectData {
  _id: string;
  userInfo?: UserInfo;
  clientId?: string;
  projectDetails: ProjectDetails;
  pricing: PricingOption;
  status: "pending" | "reviewed" | "approved" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  startDate?: Date;
  endDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
  updates?: ProjectUpdate[];
  files?: ProjectFile[];
  payments?: Payment[];
}
