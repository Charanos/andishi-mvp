'use client';

import { useState, useCallback } from 'react';
import { ReviewType, ReviewFormData } from '@/types';
import { useAuth } from './useAuth';

export const useReviewCrud = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const createReview = useCallback(async (reviewData: ReviewFormData): Promise<ReviewType | null> => {
    if (!isAdmin) {
      setError('Unauthorized. Admin access required.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create review');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create review';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  const updateReview = useCallback(async (id: string, reviewData: Partial<ReviewFormData>): Promise<ReviewType | null> => {
    if (!isAdmin) {
      setError('Unauthorized. Admin access required.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update review');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  const deleteReview = useCallback(async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      setError('Unauthorized. Admin access required.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete review');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  const fetchReviews = useCallback(async (): Promise<ReviewType[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      return result.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createReview,
    updateReview,
    deleteReview,
    fetchReviews,
    isLoading,
    error,
    isAdmin,
    clearError: () => setError(null)
  };
};
