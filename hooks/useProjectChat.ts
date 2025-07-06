import useSWR from 'swr';
import { useCallback } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProjectChat(projectId: string) {
    const { data, error, mutate } = useSWR(`/api/project-chat/${projectId}`, fetcher, { refreshInterval: 3000 });

    // Send message
    const sendMessage = useCallback(async (content: string) => {
        await fetch(`/api/project-chat/${projectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
        mutate();
    }, [projectId, mutate]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        await fetch(`/api/project-chat/${projectId}`, { method: 'PUT' });
        mutate();
    }, [projectId, mutate]);

    return {
        messages: data?.messages || [],
        participants: data?.participants || [],
        loading: !data && !error,
        error,
        sendMessage,
        markAsRead,
        refetch: mutate,
    };
}
