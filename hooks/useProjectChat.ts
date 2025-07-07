import useSWR from 'swr';
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { User } from '@/types/auth';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export function useProjectChat(projectId: string) {
    const { user, token } = useAuth();
    const { data, error, mutate } = useSWR(`/api/project-chat/${projectId}`, fetcher, { refreshInterval: 3000 });

    // Send message
    const sendMessage = useCallback(async (content: string) => {
        if (!user) throw new Error('User not authenticated');
        await fetch(`/api/project-chat/${projectId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    senderId: user.id,
                    senderName: user.name || user.email,
                    senderRole: user.role,
                    content
                }),
                credentials: 'include',
            }
        );
        mutate();
    }, [projectId, mutate, user, token]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (!user) throw new Error('User not authenticated');
        await fetch(`/api/project-chat/${projectId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ userId: user.id }),
                credentials: 'include',
            }
        );
        mutate();
    }, [projectId, mutate, user, token]);

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
