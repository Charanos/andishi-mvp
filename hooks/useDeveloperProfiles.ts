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

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    updateProfile,
  };
};
