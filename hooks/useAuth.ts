'use client'

import { RBACService } from '@/utils/rbac';
import { useRouter } from 'next/navigation';
import { User, AuthContextType, Permission, UserRole } from '@/types/auth';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to verify auth token
async function verifyAuthToken(token: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return {
        ...userData,
        permissions: RBACService.getUserPermissions(userData.role)
      };
    }
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      let currentUser: User | null = null;

      // 1) Try to verify JWT from localStorage
      if (storedToken) {
        currentUser = await verifyAuthToken(storedToken);
      }

      // 2) Fallback to cookie-based verification handled by the server
      if (!currentUser) {
        const resp = await fetch('/api/auth/verify');
        if (resp.ok) {
          const cookieUser: User = await resp.json();
          currentUser = {
            ...cookieUser,
            permissions: RBACService.getUserPermissions(cookieUser.role),
          };
        }
      }

      if (currentUser) {
        setUser(currentUser);
      } else {
        // Invalid or missing session – clean up
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
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