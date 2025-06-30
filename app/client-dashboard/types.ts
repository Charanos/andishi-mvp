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
