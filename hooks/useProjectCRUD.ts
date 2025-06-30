import { useState, useCallback } from 'react';
import { ProjectData, Milestone, ProjectFile, Payment, ProjectUpdate } from '@/types';

interface CRUDResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface ProjectCRUDHook {
  loading: boolean;
  error: string | null;
  // Project operations
  updateProject: (projectId: string, updates: Partial<ProjectData>) => Promise<CRUDResponse>;
  deleteProject: (projectId: string) => Promise<CRUDResponse>;
  
  // Milestone operations
  createMilestone: (projectId: string, milestone: Omit<Milestone, 'id'>) => Promise<CRUDResponse>;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<Milestone>) => Promise<CRUDResponse>;
  deleteMilestone: (projectId: string, milestoneId: string) => Promise<CRUDResponse>;
  
  // File operations
  createFile: (projectId: string, file: Omit<ProjectFile, 'id' | 'createdAt'>) => Promise<CRUDResponse>;
  updateFile: (projectId: string, fileId: string, updates: Partial<ProjectFile>) => Promise<CRUDResponse>;
  deleteFile: (projectId: string, fileId: string) => Promise<CRUDResponse>;
  
  // Payment operations
  createPayment: (projectId: string, payment: Omit<Payment, 'id'>) => Promise<CRUDResponse>;
  updatePayment: (projectId: string, paymentId: string, updates: Partial<Payment>) => Promise<CRUDResponse>;
  deletePayment: (projectId: string, paymentId: string) => Promise<CRUDResponse>;
  
  // Update operations
  createUpdate: (projectId: string, update: Omit<ProjectUpdate, 'id' | 'createdAt'>) => Promise<CRUDResponse>;
  deleteUpdate: (projectId: string, updateId: string) => Promise<CRUDResponse>;
}

export const useProjectCRUD = (): ProjectCRUDHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async (operation: string, projectId: string, data?: any, itemId?: string): Promise<CRUDResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await fetch('/api/client-projects', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-email': userEmail || '',
        },
        body: JSON.stringify({
          projectId,
          operation,
          data,
          itemId
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Operation failed');
      }

      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Project operations
  const updateProject = useCallback(async (projectId: string, updates: Partial<ProjectData>): Promise<CRUDResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await fetch('/api/client-projects', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-email': userEmail || '',
        },
        body: JSON.stringify({ projectId, ...updates }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update project');
      }

      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string): Promise<CRUDResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await fetch('/api/client-projects', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-email': userEmail || '',
        },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete project');
      }

      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Milestone operations
  const createMilestone = useCallback((projectId: string, milestone: Omit<Milestone, 'id'>) =>
    makeRequest('milestone_create', projectId, milestone), [makeRequest]);

  const updateMilestone = useCallback((projectId: string, milestoneId: string, updates: Partial<Milestone>) =>
    makeRequest('milestone_update', projectId, updates, milestoneId), [makeRequest]);

  const deleteMilestone = useCallback((projectId: string, milestoneId: string) =>
    makeRequest('milestone_delete', projectId, undefined, milestoneId), [makeRequest]);

  // File operations
  const createFile = useCallback((projectId: string, file: Omit<ProjectFile, 'id' | 'createdAt'>) =>
    makeRequest('file_create', projectId, file), [makeRequest]);

  const updateFile = useCallback((projectId: string, fileId: string, updates: Partial<ProjectFile>) =>
    makeRequest('file_update', projectId, updates, fileId), [makeRequest]);

  const deleteFile = useCallback((projectId: string, fileId: string) =>
    makeRequest('file_delete', projectId, undefined, fileId), [makeRequest]);

  // Payment operations
  const createPayment = useCallback((projectId: string, payment: Omit<Payment, 'id'>) =>
    makeRequest('payment_create', projectId, payment), [makeRequest]);

  const updatePayment = useCallback((projectId: string, paymentId: string, updates: Partial<Payment>) =>
    makeRequest('payment_update', projectId, updates, paymentId), [makeRequest]);

  const deletePayment = useCallback((projectId: string, paymentId: string) =>
    makeRequest('payment_delete', projectId, undefined, paymentId), [makeRequest]);

  // Update operations
  const createUpdate = useCallback((projectId: string, update: Omit<ProjectUpdate, 'id' | 'createdAt'>) =>
    makeRequest('update_create', projectId, update), [makeRequest]);

  const deleteUpdate = useCallback((projectId: string, updateId: string) =>
    makeRequest('update_delete', projectId, undefined, updateId), [makeRequest]);

  return {
    loading,
    error,
    updateProject,
    deleteProject,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createFile,
    updateFile,
    deleteFile,
    createPayment,
    updatePayment,
    deletePayment,
    createUpdate,
    deleteUpdate,
  };
};
