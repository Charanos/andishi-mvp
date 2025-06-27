// Define base interface for required fields
export interface BaseProjectWithDetails {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold";
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  techStack: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Extend base interface for optional fields
export interface ProjectWithDetails extends BaseProjectWithDetails {
  category?: string;
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
  }>;
  updates?: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: Date;
  }>;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
    createdAt: Date;
  }>;
} 