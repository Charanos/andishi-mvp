import { useState, useEffect, useCallback } from 'react';

interface SystemUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  company?: string;
  phone?: string;
  role: "admin" | "developer" | "client";
  status: "active" | "inactive" | "suspended";
  isActive: boolean;
  accountCreated: boolean;
  passwordGenerated: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  skills?: string[];
  hourlyRate?: number;
  projectsCount?: number;
  completedProjects?: number;
  activeProjects?: number;
  totalEarnings?: number;
  developerProfileStatus?: "pending" | "approved" | "rejected";
  developerProfileId?: string;
  isAvailable?: boolean;
  busyUntilDate?: Date | null;
  availabilityDisplayText?: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = refresh ? '/api/users?refresh=true' : '/api/users';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(() => {
    return fetchUsers(true);
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the users list to get updated data
        await refreshUsers();
        return result;
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, [refreshUsers]);

  const updateUser = useCallback(async (userId: string, updates: Partial<SystemUser>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: userId,
          ...updates
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the users list to get updated data
        await refreshUsers();
        return result;
      } else {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, [refreshUsers]);

  const createUser = useCallback(async (userData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the users list to get updated data
        await refreshUsers();
        return result;
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  }, [refreshUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    refreshUsers,
    deleteUser,
    updateUser,
    createUser,
    setUsers
  };
};
