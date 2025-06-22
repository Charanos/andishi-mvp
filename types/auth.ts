export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  profile?: UserProfile;
}

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  DEVELOPER = 'developer'
}

export enum Permission {
  // Project Management
  CREATE_PROJECT = 'create_project',
  VIEW_PROJECT = 'view_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  ASSIGN_PROJECT = 'assign_project',
  
  // User Management
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  
  // Developer Specific
  APPLY_TO_PROJECT = 'apply_to_project',
  VIEW_TALENT_POOL = 'view_talent_pool',
  UPDATE_PORTFOLIO = 'update_portfolio',
  SUBMIT_WORK = 'submit_work',
  
  // Client Specific
  POST_PROJECT = 'post_project',
  HIRE_DEVELOPER = 'hire_developer',
  REVIEW_SUBMISSIONS = 'review_submissions',
  MAKE_PAYMENT = 'make_payment',
  
  // Admin Specific
  MANAGE_PLATFORM = 'manage_platform',
  VIEW_ANALYTICS = 'view_analytics',
  MODERATE_CONTENT = 'moderate_content',
  HANDLE_DISPUTES = 'handle_disputes',
  MANAGE_PAYMENTS = 'manage_payments',
  
  // General
  VIEW_DASHBOARD = 'view_dashboard',
  UPDATE_PROFILE = 'update_profile',
  CHANGE_PASSWORD = 'change_password'
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  portfolio?: string;
  hourlyRate?: number;
  timezone?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  redirectToDashboard: () => void;
  isLoading: boolean;
}