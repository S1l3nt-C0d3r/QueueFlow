import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth.context";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while authentication state is being restored
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User does not have permission
  if (!requiredRoles.includes(user.roleId)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}