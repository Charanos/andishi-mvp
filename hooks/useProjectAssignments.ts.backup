import useSWR from 'swr';
import type { Assignment } from '@/types/project';
import type { DeveloperProfile as Developer } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAvailableDevelopers() {
    // NOTE: Replace with real endpoint if available
    const { data, error, mutate } = useSWR<Developer[]>('/api/project-assignments/available', fetcher);
    return {
        developers: data || [],
        loading: !data && !error,
        error,
        refetch: mutate,
    };
}

export function useProjectAssignments(projectId: string) {
    const { data, error, mutate } = useSWR<Assignment[]>(`/api/project-assignments/${projectId}`, fetcher);

    // Assign developers
    const assignDevelopers = async (developerIds: string[], role = 'Developer') => {
        const res = await fetch('/api/project-assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, developerIds, role }),
        });
        if (!res.ok) throw new Error(await res.text());
        await mutate();
        return res.json();
    };

    // Update assignment (status/role)
    const updateAssignment = async (developerId: string, updates: Partial<Assignment>) => {
        const res = await fetch(`/api/project-assignments/${projectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ developerId, updates }),
        });
        if (!res.ok) throw new Error(await res.text());
        await mutate();
        return res.json();
    };

    // Remove assignment
    const removeAssignment = async (developerId: string) => {
        const res = await fetch(`/api/project-assignments/${projectId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ developerId }),
        });
        if (!res.ok) throw new Error(await res.text());
        await mutate();
        return res.json();
    };

    return {
        assignments: data || [],
        loading: !data && !error,
        error,
        refetch: mutate,
        assignDevelopers,
        updateAssignment,
        removeAssignment,
    };
}
