import { useAuth } from "@/hooks/useAuth";
import { Permission, UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback = <div>Access Denied</div>,
}) => {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user) {
    return <div>Please log in to continue</div>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }

  return <>{children}</>;
};
