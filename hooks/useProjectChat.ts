import useSWR from 'swr';
import { useCallback } from 'react';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

// Enhanced hook with typing for better TypeScript support
export interface ChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
    replyToMessageId?: string;
    replyToMessage?: ChatMessage;
}

export interface ChatParticipant {
    id: string;
    chatId: string;
    userId: string;
    name: string;
    role: string;
    isOnline: boolean;
}

export interface ProjectChat {
    id: string;
    projectId: string;
    lastActivity: Date;
    messages: ChatMessage[];
    participants: ChatParticipant[];
}

// Enhanced fetcher with better error handling
const fetcher = async (url: string) => {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
};

export function useProjectChat(projectId: string) {
    const { user, token } = useAuth();
    const { toast } = useToast();

    // Only fetch if user is authenticated and projectId exists
    const shouldFetch = user && projectId;

    const { data, error, mutate, isLoading } = useSWR<ProjectChat>(
        shouldFetch ? `/api/project-chat/${projectId}` : null,
        fetcher,
        {
            refreshInterval: 3000,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            errorRetryCount: 3,
            errorRetryInterval: 1000,
        }
    );

    // Send message - simplified to only send content
    const sendMessage = useCallback(async (content: string, replyToMessageId?: string) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        if (!content || !content.trim()) {
            throw new Error('Message content cannot be empty');
        }

        try {
            const response = await fetch(`/api/project-chat/${projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    senderId: user.id,
                    senderName: user.name || user.email.split('@')[0], // Use user's name or extract from email
                    senderRole: user.role,
                    content: content.trim(),
                    ...(replyToMessageId && { replyToMessageId })
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to send message: ${errorText}`);
            }

            const newMessage = await response.json();

            // Optimistically update the cache
            mutate((currentData: ProjectChat | undefined) => {
                if (currentData) {
                    return {
                        ...currentData,
                        messages: [...(currentData.messages || []), newMessage],
                    };
                }
                return currentData;
            }, false);

            return newMessage;
        } catch (error: any) {
            toast.error(`Failed to send message: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]);

    // Mark messages as read - simplified to use session
    const markAsRead = useCallback(async (messageIds?: string[]) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`/api/project-chat/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    messageIds: messageIds || undefined
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to mark messages as read: ${errorText}`);
            }

            // Optimistically update the cache
            mutate((currentData: ProjectChat | undefined) => {
                if (currentData) {
                    return {
                        ...currentData,
                        messages: currentData.messages.map((msg: ChatMessage) => ({
                            ...msg,
                            isRead: msg.senderId === user.id ? msg.isRead : true
                        })),
                    };
                }
                return currentData;
            }, false);

            return await response.json();
        } catch (error: any) {
            toast.error(`Failed to mark messages as read: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]);

    // Update online status
    const updateOnlineStatus = useCallback(async (isOnline: boolean = true) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`/api/project-chat/${projectId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ isOnline }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update online status: ${errorText}`);
            }

            return await response.json();
        } catch (error: any) {
            toast.error(`Failed to update online status: ${error.message}`);
            throw error;
        }
    }, [projectId, user, token, toast]);

    // Get unread message count
    const getUnreadCount = useCallback(() => {
        if (!data?.messages || !user) return 0;
        return data.messages.filter(
            (msg: ChatMessage) => msg.senderId !== user.id && !msg.isRead
        ).length;
    }, [data?.messages, user]);

    // Get online participants
    const getOnlineParticipants = useCallback(() => {
        if (!data?.participants) return [];
        return data.participants.filter((p: ChatParticipant) => p.isOnline);
    }, [data?.participants]);

    const updateMessage = useCallback(async (messageId: string, content: string) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`/api/project-chat/${projectId}/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ content }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update message: ${errorText}`);
            }

            const updatedMessage = await response.json();

            mutate((currentData: ProjectChat | undefined) => {
                if (currentData) {
                    return {
                        ...currentData,
                        messages: currentData.messages.map((msg) =>
                            msg.id === messageId ? updatedMessage : msg
                        ),
                    };
                }
                return currentData;
            }, false);

            return updatedMessage;
        } catch (error: any) {
            toast.error(`Failed to update message: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]);

    const deleteMessage = useCallback(async (messageId: string) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`/api/project-chat/${projectId}/${messageId}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete message: ${errorText}`);
            }

            mutate((currentData: ProjectChat | undefined) => {
                if (currentData) {
                    return {
                        ...currentData,
                        messages: currentData.messages.filter((msg) => msg.id !== messageId),
                    };
                }
                return currentData;
            }, false);
        } catch (error: any) {
            toast.error(`Failed to delete message: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]);

    return {
        // Data
        messages: data?.messages || [],
        participants: data?.participants || [],
        chat: data,

        // States
        loading: isLoading,
        error,

        // Actions
        sendMessage,
        updateMessage,
        deleteMessage,
        markAsRead,
        updateOnlineStatus,
        refetch: mutate,

        // Computed values
        unreadCount: getUnreadCount(),
        onlineParticipants: getOnlineParticipants(),

        // Helpers
        isUserOnline: (userId: string) => {
            const participant = data?.participants?.find((p: ChatParticipant) => p.userId === userId);
            return participant?.isOnline || false;
        },

        // Connection status
        isConnected: !error && !isLoading,
    };
}

// Typed version of the hook
export function useTypedProjectChat(projectId: string) {
    const result = useProjectChat(projectId);
    return result as {
        messages: ChatMessage[];
        participants: ChatParticipant[];
        chat: ProjectChat | undefined;
        loading: boolean;
        error: Error | undefined;
        sendMessage: (content: string, replyToMessageId?: string) => Promise<ChatMessage>;
        updateMessage: (messageId: string, content: string) => Promise<ChatMessage>;
        deleteMessage: (messageId: string) => Promise<void>;
        markAsRead: (messageIds?: string[]) => Promise<any>;
        updateOnlineStatus: (isOnline?: boolean) => Promise<any>;
        refetch: () => void;
        unreadCount: number;
        onlineParticipants: ChatParticipant[];
        isUserOnline: (userId: string) => boolean;
        isConnected: boolean;
    };
}