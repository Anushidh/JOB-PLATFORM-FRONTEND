import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { Spinner } from '@/components/ui';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    const dashboardPath = role === 'admin' ? '/admin' : `/${role}`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}
