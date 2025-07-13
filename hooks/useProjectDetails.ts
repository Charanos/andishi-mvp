import useSWR from 'swr';
import { useAuth } from './useAuth';
import { ProjectData } from '../types/project';

// Enhanced fetcher with better error handling
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.success ? data.data : null;
};

export interface ProjectDetailsSidebar {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  priority: string;
  budget?: number;
  progress: number;
  tags: string[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: string;
    priority: string;
    assignedTo: string[];
  }>;
  resources: Array<{
    id: string;
    name: string;
    type: "file" | "link" | "image" | "document";
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
    size?: string;
    description?: string;
  }>;
  notes: string;
  lastActivity: Date;
}

export function useProjectDetails(projectId: string) {
  const { user } = useAuth();

  // Only fetch if user is authenticated and projectId exists
  const shouldFetch = user && projectId;

  const { data, error, mutate, isLoading } = useSWR<ProjectData>(
    shouldFetch ? `/api/client-projects?id=${projectId}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  );

  // Transform the project data for the sidebar
  const transformProjectForSidebar = (project: ProjectData): ProjectDetailsSidebar => {
    return {
      id: project._id,
      title: project.projectDetails.title,
      description: project.projectDetails.description,
      status: project.status,
      startDate: project.startDate || project.createdAt,
      endDate: project.endDate || project.estimatedCompletionDate,
      priority: project.priority,
      budget: project.pricing?.fixedBudget ? parseFloat(project.pricing.fixedBudget) : undefined,
      progress: project.progress,
      tags: project.projectDetails.techStack || [],
      milestones: (project.milestones || []).map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate || new Date(),
        status: milestone.status,
        priority: "medium", // Default priority since it's not in the milestone data
        assignedTo: [] // This would need to come from project assignments
      })),
      resources: (project.files || []).map(file => ({
        id: file.id,
        name: file.fileName,
        type: file.fileType === "document" ? "document" : 
              file.fileType === "image" ? "image" : "file",
        url: file.fileUrl,
        uploadedBy: file.uploadedBy || "Client",
        uploadedAt: file.createdAt,
        size: file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : undefined,
        description: file.description
      })),
      notes: project.projectDetails.requirements || "",
      lastActivity: new Date(project.createdAt) // Use creation date as fallback
    };
  };

  return {
    projectDetails: data ? transformProjectForSidebar(data) : null,
    loading: isLoading,
    error,
    refetch: mutate,
    
    // Helper functions
    isProjectActive: () => data?.status === 'in-progress',
    isProjectCompleted: () => data?.status === 'completed',
    getProgressPercentage: () => data?.progress || 0,
    getTotalMilestones: () => data?.milestones?.length || 0,
    getCompletedMilestones: () => data?.milestones?.filter(m => m.status === 'completed')?.length || 0,
    getTotalFiles: () => data?.files?.length || 0,
    
    // Raw project data for advanced use cases
    rawProjectData: data,
  };
}
