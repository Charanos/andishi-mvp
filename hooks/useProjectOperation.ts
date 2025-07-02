import { Project } from "@/lib/devData";
// Enhanced interfaces with CRUD operations
interface Milestone {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  dueDate?: Date;
  completedAt?: Date;
  order: number;
}

interface Update {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: Date;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
}

interface ProjectDetails {
  title: string;
  description: string;
  category?: string;
  timeline?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  techStack: string[];
  requirements?: string;
}

interface ProjectWithDetails {
  id: string;
  title: string;
  description: string;
  category?: string;
  timeline?: string;
  urgency?: string;
  techStack: string[];
  requirements?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled" | "on_hold";
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  startDate?: Date;
  endDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  pricing?: {
    type: "fixed" | "milestone" | "hourly";
    currency: "USD" | "KES";
    fixedBudget?: string;
    hourlyRate?: string;
    estimatedHours?: number;
    totalPaid?: string;
  };
  milestones?: Milestone[];
  updates?: Update[];
  files?: ProjectFile[];
}

interface CRUDOperations {
  // Project operations
  updateProject: (
    id: string,
    data: Partial<ProjectWithDetails>
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Milestone operations
  createMilestone: (
    projectId: string,
    milestone: Omit<Milestone, "id">
  ) => Promise<void>;
  updateMilestone: (
    projectId: string,
    milestoneId: string,
    data: Partial<Milestone>
  ) => Promise<void>;
  deleteMilestone: (projectId: string, milestoneId: string) => Promise<void>;

  // Update operations
  createUpdate: (
    projectId: string,
    update: Omit<Update, "id" | "createdAt">
  ) => Promise<void>;
  updateUpdate: (
    projectId: string,
    updateId: string,
    data: Partial<Update>
  ) => Promise<void>;
  deleteUpdate: (projectId: string, updateId: string) => Promise<void>;

  // File operations
  uploadFile: (projectId: string, file: File) => Promise<void>;
  deleteFile: (projectId: string, fileId: string) => Promise<void>;
}

// hooks/useProjectOperations.ts
const useProjectOperations = () => {
  return {
    updateProject: async (id: string, updates: Partial<Project>) => {
      // Your API calls here
    },
    createMilestone: async (projectId: string, milestone: any) => {
      // Your API calls here
    },
    // ... other operations
  };
};