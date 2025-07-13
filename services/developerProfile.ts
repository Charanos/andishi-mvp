import { DeveloperProfile } from '@/lib/types';

export const getDeveloperProfiles = async (): Promise<DeveloperProfile[]> => {
  const res = await fetch('/api/developer-profiles');
  if (!res.ok) {
    throw new Error('Failed to fetch developer profiles');
  }
  return res.json();
};

export const updateDeveloperProfile = async (profile: DeveloperProfile): Promise<DeveloperProfile> => {
  const res = await fetch(`/api/developer-profiles`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    throw new Error('Failed to update developer profile');
  }
  return res.json();
};
