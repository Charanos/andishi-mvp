import { ProjectData } from "~/types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const api = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  const json = (await res.json()) as ApiResponse<T> | T;
  // Some endpoints return wrapped shape { success, data }
  if (typeof (json as ApiResponse<T>).success === "boolean") {
    const wrapped = json as ApiResponse<T>;
    if (!wrapped.success) throw new Error(wrapped.message || "Request failed");
    return wrapped.data as T;
  }
  return json as T;
};

export const listProjects = () => api<ProjectData[]>("/api/client-projects");

export const createProject = (project: Partial<ProjectData>) =>
  api<ProjectData>("/api/client-projects", {
    method: "POST",
    body: JSON.stringify(project),
  });

export const updateProject = (
  projectId: string,
  updates: Partial<ProjectData> | Record<string, any>
) =>
  api<{ modifiedCount?: number }>("/api/client-projects", {
    method: "PATCH",
    body: JSON.stringify({ projectId, ...updates }),
  });

export const deleteProject = (projectId: string) =>
  api<{ deletedCount?: number }>("/api/client-projects", {
    method: "DELETE",
    body: JSON.stringify({ projectId }),
  });
