import { useState, useEffect } from "react";
import { ContactFeedback } from "@/types";

interface UseFeedbackReturn {
  feedback: ContactFeedback[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchFeedback: (options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "read" | "unread";
  }) => Promise<void>;
  markAsRead: (id: string, read: boolean) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
}

export function useFeedback(): UseFeedbackReturn {
  const [feedback, setFeedback] = useState<ContactFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchFeedback = async (options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "read" | "unread";
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.search) params.append("search", options.search);
      if (options.status) params.append("status", options.status);
      
      const response = await fetch(`/api/feedback?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.status}`);
      }
      
      const data = await response.json();
      setFeedback(data.feedback);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, read: boolean) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update feedback status' }));
        throw new Error(errorData.message || `Failed to update feedback: ${response.status}`);
      }

      // Update local state
      setFeedback(prev =>
        prev.map(item =>
          item.id === id ? { ...item, read } : item
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error updating feedback:", err);
      throw err; // Re-throw the error to be caught by the component
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete feedback' }));
        throw new Error(errorData.message || `Failed to delete feedback: ${response.status}`);
      }

      // Remove from local state
      setFeedback(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error deleting feedback:", err);
      throw err; // Re-throw the error to be caught by the component
    }
  };

  return {
    feedback,
    loading,
    error,
    pagination,
    fetchFeedback,
    markAsRead,
    deleteFeedback,
  };
}
