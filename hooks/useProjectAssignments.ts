import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAvailableDevelopers() {
    const { data, error, mutate } = useSWR('/api/project-assignments/available', fetcher);
    return {
        developers: data || [],
        loading: !data && !error,
        error,
        refetch: mutate,
    };
}

export function useProjectAssignments(projectId: string) {
    const { data, error, mutate } = useSWR(`/api/project-assignments/${projectId}`, fetcher);
    return {
        assignments: data || [],
        loading: !data && !error,
        error,
        refetch: mutate,
    };
}
