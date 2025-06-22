import { Permission, User, UserRole } from "@/types/auth";
import { DASHBOARD_ROUTES, ROLE_PERMISSIONS } from "@/config/rbac";

export class RBACService {
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user || !user.isActive) return false;
    
    // Check if user has the specific permission
    return user.permissions.includes(permission) || 
           ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  }
  
  static hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
  }
  
  static hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false;
  }
  
  static canAccessRoute(user: User | null, route: string): boolean {
    if (!user || !user.isActive) return false;
    
    // Define route access rules
    const routePermissions: Record<string, Permission[]> = {
      '/admin-dashboard': [Permission.MANAGE_PLATFORM],
      '/client-dashboard': [Permission.POST_PROJECT, Permission.HIRE_DEVELOPER],
      '/developer-dashboard': [Permission.APPLY_TO_PROJECT, Permission.SUBMIT_WORK],
      '/start-project': [Permission.CREATE_PROJECT],
      '/projects/manage': [Permission.EDIT_PROJECT],
      '/users/manage': [Permission.VIEW_USERS],
      '/analytics': [Permission.VIEW_ANALYTICS],
    };
    
    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // Public route
    
    return requiredPermissions.some(permission => 
      this.hasPermission(user, permission)
    );
  }
  
  static getDashboardRoute(user: User | null): string {
    if (!user) return '/login';
    return DASHBOARD_ROUTES[user.role] || '-dashboard';
  }
  
  static getUserPermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}