import { useState, useEffect, useCallback } from 'react';
import { DeveloperProfile } from '@/lib/types';
import { getDeveloperProfiles, updateDeveloperProfile } from '@/services/developerProfile';

export const useDeveloperProfiles = () => {
  const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDeveloperProfiles();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profile: DeveloperProfile) => {
    try {
      const updated = await updateDeveloperProfile(profile);
      setProfiles(prev => prev.map(p => p.id === profile.id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  }, []);

  const approveProfile = useCallback(async (profileId: string) => {
    try {
      const response = await fetch('/api/developer-profiles/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId, action: 'approve' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve profile');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the profiles list to get updated data
        await fetchProfiles();
        return result;
      } else {
        throw new Error(result.message || 'Failed to approve profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve profile');
      throw err;
    }
  }, [fetchProfiles]);

  const rejectProfile = useCallback(async (profileId: string) => {
    try {
      const response = await fetch('/api/developer-profiles/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId, action: 'reject' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject profile');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the profiles list to get updated data
        await fetchProfiles();
        return result;
      } else {
        throw new Error(result.message || 'Failed to reject profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject profile');
      throw err;
    }
  }, [fetchProfiles]);

  const deleteProfile = useCallback(async (profileId: string) => {
    try {
      const response = await fetch(`/api/developer-profiles?id=${profileId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }
      
      // Refresh the profiles list to get updated data
      await fetchProfiles();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      throw err;
    }
  }, [fetchProfiles]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    updateProfile,
    approveProfile,
    rejectProfile,
    deleteProfile,
  };
};
