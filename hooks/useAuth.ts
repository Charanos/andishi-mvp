'use client'

import { getAbsoluteUrl } from '@/lib/utils';
import { RBACService } from '@/utils/rbac';
import { useRouter } from 'next/navigation';
import { User, AuthContextType as AuthContextTypeDefinition, Permission, UserRole } from '@/types/auth';
import React, { createContext, useContext, useState, useEffect } from 'react';


export interface AuthContextType extends AuthContextTypeDefinition {
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to verify authentication either via Bearer token (if provided)
// or by relying on the httpOnly "auth_token" cookie that the server sets.
// Making the token parameter optional guarantees that a user will stay logged in
// even if the token is missing from localStorage (e.g. after hard refresh).
async function verifyAuthToken(token?: string): Promise<User | null> {
  try {
    // Build request headers dynamically – only attach Authorization when we
    // actually have a token. This keeps the request small and also ensures we
    // don't send an empty header that could confuse CORS policies.
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

        const response = await fetch(getAbsoluteUrl('/api/auth/verify'), {
      method: 'GET',
      headers,
      credentials: 'include', // Send cookies for server-side JWT validation
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Verification failed');
    }

    const userData = result.data;
    return {
      ...userData,
      permissions: RBACService.getUserPermissions(userData.role),
    };
  } catch (error) {
    // Network errors (TypeError: Failed to fetch) end up here as well. Returning
    // null allows the caller to treat it as an unauthenticated state instead of
    // crashing the app.
    console.error('Token verification error:', error);
    return null;
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
        setToken(typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    checkAuthStatus();
  }, []);

  /**
   * Attempt to verify the current session. We try, in order:
   *  1. Remote verification using the token from localStorage (fastest, no cookies).
   *  2. Remote verification relying on the httpOnly cookie (in case localStorage was cleared).
   *  3. Local decoding of the JWT to keep the user logged-in in offline / network-error scenarios.
   */
  const checkAuthStatus = async () => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      let currentUser: User | null = null;
      let networkError = false;

      // 1) Validate via Authorization header when we have a token in storage
      if (storedToken) {
        currentUser = await verifyAuthToken(storedToken);
        // If token exists but verification returned null, we could be offline or the
        // token is invalid. Assume network error first; we'll treat it as invalid
        // only if remote cookie verification also fails.
        if (!currentUser) {
          networkError = true;
        }
      }

      // 2) Validate via cookie if we still don't have a user
      if (!currentUser) {
        try {
          currentUser = await verifyAuthToken();
        } catch (err) {
          networkError = networkError || (err as Error)?.message?.includes('Failed to fetch');
        }
      }

      // 3) Offline fallback – decode the token locally so UI can still render
      if (!currentUser && storedToken && networkError) {
        const decoded = decodeTokenPayload(storedToken);
        if (decoded) {
          currentUser = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            role: decoded.role,
            permissions: RBACService.getUserPermissions(decoded.role as UserRole),
            isActive: true,
            name: decoded.name ?? '',
          } as User;
        }
      }

      // If we got a valid user, make sure the cookie exists for server requests
      if (currentUser) {
        ensureCookieToken(storedToken!);
        setUser(currentUser);
        // Keep localStorage user info in sync
        localStorage.setItem('userEmail', currentUser.email);
        localStorage.setItem('userRole', currentUser.role as string);
      } else if (!networkError) {
        // Only clear storage when the server explicitly tells us the token is invalid
                localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Lightweight JWT decoder (no external dependency) – *not* a substitute for
   * server side validation but good enough to read non-sensitive fields when we
   * are offline.
   */
  /**
   * Ensure the auth_token cookie exists. This is a fallback for local/dev where the
   * Set-Cookie header may be stripped. The cookie is NOT httpOnly, but is still
   * SameSite=Lax so it will only be sent to our own origin.
   */
  const ensureCookieToken = (token: string) => {
    if (typeof document === 'undefined') return;
    if (!document.cookie.split('; ').some(c => c.startsWith('auth_token='))) {
      document.cookie = `auth_token=${token}; path=/; SameSite=Lax`;
    }
  };

  const decodeTokenPayload = (token: string): Record<string, any> | null => {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%'.concat(('00' + c.charCodeAt(0).toString(16)).slice(-2)))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const { user: userData, token } = await response.json();
      
      // Validate response structure
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }

      // Store token
            localStorage.setItem('auth_token', token);
      setToken(token);
      ensureCookieToken(token);
      // Persist user identifiers for client-side API calls
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userRole', userData.role);

      // Set user with permissions based on role
      const userWithPermissions = {
        ...userData,
        permissions: RBACService.getUserPermissions(userData.role),
      } as User;

      setUser(userWithPermissions);

      // Redirect immediately using fresh user object (state update is async)
      const dashboardRoute = RBACService.getDashboardRoute(userWithPermissions);
      router.push(dashboardRoute);
      redirectToDashboard();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Notify server to clear cookie
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
            localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      router.push('/login');
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return RBACService.hasPermission(user, permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return RBACService.hasRole(user, role);
  };

  const redirectToDashboard = () => {
    if (user) {
      const dashboardRoute = RBACService.getDashboardRoute(user);
      router.push(dashboardRoute);
    }
  };

    const contextValue: AuthContextType = {
        user,
    token,
    login,
    logout,
    hasPermission,
    hasRole,
    redirectToDashboard,
    isLoading
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};