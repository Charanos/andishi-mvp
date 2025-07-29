'use client';

import { useState, useCallback } from 'react';
import { BlogPostType } from '@/lib/blogData';
import { useAuth } from './useAuth';

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image?: string;
  authorImage?: string;
}

export const useBlogCrud = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const createBlog = useCallback(async (blogData: BlogFormData): Promise<BlogPostType | null> => {
    if (!isAdmin) {
      setError('Unauthorized. Admin access required.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(blogData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create blog post');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  const updateBlog = useCallback(async (id: string, blogData: Partial<BlogFormData>): Promise<BlogPostType | null> => {
    if (!isAdmin) {
      setError('Unauthorized. Admin access required.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(blogData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update blog post');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog post';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  const deleteBlog = useCallback(async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      setError('Unauthorized. Admin access required.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete blog post');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog post';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  const fetchBlogs = useCallback(async (page: number = 1, limit: number = 10): Promise<{ blogs: BlogPostType[], pagination: any }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blogs?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch blogs');
      }

      return {
        blogs: result.data || [],
        pagination: result.pagination || {}
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blogs';
      setError(errorMessage);
      return { blogs: [], pagination: {} };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Legacy function for backward compatibility - fetches all blogs from first page
  const fetchAllBlogs = useCallback(async (): Promise<BlogPostType[]> => {
    const result = await fetchBlogs(1, 50); // Get first 50 blogs
    return result.blogs;
  }, [fetchBlogs]);

  return {
    createBlog,
    updateBlog,
    deleteBlog,
    fetchBlogs,
    fetchAllBlogs,
    isLoading,
    error,
    isAdmin,
    clearError: () => setError(null)
  };
};
