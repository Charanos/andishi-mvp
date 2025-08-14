import { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface HomepageProjectType {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  projectImages: string[];
  technologies: string[];
  gradient: string;
  liveUrl: string;
  githubUrl: string;
  projectUrl: string;
  client: string;
  duration: string;
  teamSize: string;
  featured: boolean;
  status: 'completed' | 'in-progress' | 'planning';
  createdAt: Date;
  updatedAt: Date;
}

export interface HomepageProjectFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  image: string;
  projectImages: string[];
  client: string;
  duration: string;
  teamSize: string;
  featured: boolean;
  status: 'completed' | 'in-progress' | 'planning';
  liveUrl?: string;
  githubUrl?: string;
  projectUrl?: string;
}

export const useHomepageProjectCRUD = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  // Fetch all homepage projects
  const fetchHomepageProjects = useCallback(async (): Promise<HomepageProjectType[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/homepage-projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch homepage projects');
      }
      
      return data.projects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching homepage projects:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new homepage project
  const createHomepageProject = useCallback(
    async (projectData: HomepageProjectFormData): Promise<HomepageProjectType | null> => {
      if (!isAdmin) {
        setError('Unauthorized: Only admins can create projects');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/homepage-projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(projectData),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to create homepage project');
        }

        return data.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error creating homepage project:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, token]
  );

  // Update a homepage project
  const updateHomepageProject = useCallback(
    async (
      id: string,
      projectData: Partial<HomepageProjectFormData>
    ): Promise<HomepageProjectType | null> => {
      if (!isAdmin) {
        setError('Unauthorized: Only admins can update projects');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/homepage-projects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ id, ...projectData }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to update homepage project');
        }

        return data.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error updating homepage project:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, token]
  );

  // Delete a homepage project
  const deleteHomepageProject = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAdmin) {
        setError('Unauthorized: Only admins can delete projects');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/homepage-projects?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to delete homepage project');
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error deleting homepage project:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, token]
  );

  return {
    fetchHomepageProjects,
    createHomepageProject,
    updateHomepageProject,
    deleteHomepageProject,
    isLoading,
    error,
    isAdmin,
    clearError: () => setError(null),
  };
};
