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

export type ProjectStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "reviewed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "on_hold";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  deliverables?: string[];
  status: ProjectStatus;
  dueDate?: Date | string;
  completedAt?: Date | string;
  order: number;
  // Milestone approval workflow
  submittedBy?: "client" | "admin";
  approvedBy?: string;
  approvedAt?: Date | string;
  rejectedBy?: string;
  rejectedAt?: Date | string;
  rejectionReason?: string;
}

export interface PricingOption {
  type: "fixed" | "milestone" | "hourly";
  currency: "USD" | "KES";
  fixedBudget?: string;
  milestones?: Milestone[];
  hourlyRate?: string;
  estimatedHours?: string;
  // Added based on usage
  totalPaid?: string;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: Date | string;
  // Added based on usage
  author?: string;
  isAdminResponse?: boolean;
  parentUpdateId?: string;
}

export interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date | string;
  // Added based on usage
  uploadedBy?: string;
  description?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
  // Added based on usage
  currency?: "USD" | "KES";
  dueDate?: Date | string;
  paidDate?: Date | string;
  status?: "pending" | "approved" | "rejected" | "paid" | "overdue" | "partial";
  description?: string;
  invoiceUrl?: string;
  // Payment approval workflow
  submittedBy?: "client" | "admin";
  approvedBy?: string;
  approvedAt?: Date | string;
  rejectedBy?: string;
  rejectedAt?: Date | string;
  rejectionReason?: string;
}

export interface ProjectData {
  _id: string;
  userInfo?: UserInfo;
  clientId?: string;
  projectDetails: ProjectDetails;
  pricing: PricingOption;
   status: ProjectStatus;
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  startDate?: Date | string;
  endDate?: Date | string;
  estimatedCompletionDate?: Date | string;
  actualCompletionDate?: Date | string;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
  updates?: ProjectUpdate[];
  files?: ProjectFile[];
  payments?: Payment[];
  // Added based on usage
  timeline?: string;
  techStack?: string[];
  requirements?: string;
}

// Define base interface for required fields
export interface BaseProjectWithDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  techStack: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Extend base interface for optional fields
export interface ProjectWithDetails extends BaseProjectWithDetails {
  timeline?: string;
  requirements?: string;
  startDate?: Date;
  endDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  pricing?: {
    type: "fixed" | "milestone" | "hourly";
    currency: "USD" | "KES";
    fixedBudget?: string;
    hourlyRate?: string;
    estimatedHours?: number;
    totalPaid?: string;
  };
  milestones?: Milestone[];
  updates?: ProjectUpdate[];
  files?: ProjectFile[];
  payments?: Payment[];
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    role?: string;
  };
}
