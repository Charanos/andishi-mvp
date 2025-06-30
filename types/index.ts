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
  deliverables?: string[];
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: Date | string;
  completedAt?: Date | string;
  order: number;
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
  status?: "pending" | "paid" | "overdue" | "partial";
  description?: string;
  invoiceUrl?: string;
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
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold";
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
  milestones?: Array<{
    id: string;
    title: string;
    description: string;
    budget: string;
    timeline: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    dueDate?: Date;
    completedAt?: Date;
    order: number;
    deliverables?: string[];
  }>;
  updates?: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: Date;
    author?: string;
    isAdminResponse?: boolean;
    parentUpdateId?: string;
  }>;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
    createdAt: Date;
    uploadedBy?: string;
    description?: string;
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    currency?: "USD" | "KES";
    status?: "pending" | "paid" | "overdue" | "partial";
    description?: string;
    notes?: string;
    invoiceUrl?: string;
  }>;
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    role?: string;
  };
}
