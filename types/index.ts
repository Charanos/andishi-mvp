export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
}

export interface ProjectDetails {
  title: string;
  description: string;
  category: string;
  timeline: string;
  priority: "low" | "medium" | "high" | "urgent";
  techStack: string[];
  requirements: string;
  experienceLevel?: "Entry-level" | "Mid-level" | "Senior" | "Lead" | "Expert";
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

export type TrackingView = "overview" | "milestones" | "files" | "payments" | "updates" | "settings";

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
  payment?: number; // Added
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
  date?: string;
  method: string; // Will be updated to PaymentMethodType when ready
  notes?: string;
  // Added based on usage
  currency?: "USD" | "KES";
  dueDate?: Date | string;
  paidDate?: Date | string;
  status?: "pending" | "approved" | "completed" | "rejected" | "outstanding" | "paid" | "overdue" | "partial";
  description?: string;
  invoiceUrl?: string;
  // Payment approval workflow
  submittedBy?: "client" | "admin";
  approvedBy?: string;
  approvedAt?: Date | string;
  rejectedBy?: string;
  rejectedAt?: Date | string;
  rejectionReason?: string;
  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
export type SystemUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  role: "client" | "developer" | "admin";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
  projectsCount?: number;
  skills?: string[];
  hourlyRate?: number;
  passwordLastChanged?: string;
  loginAttempts?: number;
  accountLocked?: boolean;
  completedProjects?: number;
  activeProjects?: number;
  totalEarnings?: number;
  isActive: boolean;
  accountCreated: boolean;
  passwordGenerated: boolean;
  developerProfileStatus?: "pending" | "approved" | "rejected";
  developerProfileId?: string;
}

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
    estimatedHours?: string;
    totalPaid?: string;
    milestones?: Milestone[];
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

export interface ReviewType {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  rating: number;
  review: string;
  project: string;
  featured: boolean;
  timeToHire?: string;
  keyResult?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewFormData {
  name: string;
  position: string;
  avatar?: string;
  rating: number;
  review: string;
  project: string;
  featured: boolean;
  timeToHire?: string;
  keyResult?: string;
}
