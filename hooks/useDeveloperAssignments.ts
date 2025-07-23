import useSWR from "swr";
import { useAuth } from "./useAuth";

export interface DeveloperAssignment {
  id: string;
  assignedAt: Date | string;
  status: string;
  role: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    techStack: string[];
    startDate: Date | string;
    estimatedCompletionDate?: Date | string;
    progress: number;
    client: {
      id: string;
      name: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    milestones?: any[];
    requirements?: string;
    deliverables?: string[];
    timeline?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

// Reuse existing fetcher pattern
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
};

export function useDeveloperAssignments() {
  const { user } = useAuth();

  // Leverage existing project-assignments API with developer filter
  const { data, error, mutate, isLoading } = useSWR<{
    success: boolean;
    assignments: DeveloperAssignment[];
    count: number;
  }>(
    user?.role === "developer" ? `/api/project-assignments/developer/${user.id}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Update assignment status (developer can update their own assignment)
  const updateAssignmentStatus = async (
    assignmentId: string,
    status: string,
    actualHours?: number,
    notes?: string
  ) => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(
      `/api/project-assignments/developer/${user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          assignmentId, 
          status, 
          ...(actualHours !== undefined && { actualHours }),
          ...(notes && { notes })
        }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update assignment status");
    }

    mutate(); // Refresh the data
    return response.json();
  };

  return {
    assignments: data?.assignments || [],
    loading: isLoading,
    error,
    refetch: mutate,
    updateAssignmentStatus,
    count: data?.count || 0,
  };
}
