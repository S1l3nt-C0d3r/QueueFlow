import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../hooks/useUserRole';

interface ProtectedRouteProps {
  children: ReactNode;
  userRole: UserRole;
  requiredRoles: UserRole[];
  loading: boolean;
}

export function ProtectedRoute({
  children,
  userRole,
  requiredRoles,
  loading
}: ProtectedRouteProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!userRole || !requiredRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
