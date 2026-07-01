import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { Spinner } from '@/components/ui';

/**
 * Redirects authenticated users away from auth pages (login, register)
 * to their appropriate dashboard.
 */
export function GuestRoute() {
  const { isAuthenticated, isLoading, role } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isAuthenticated && role) {
    const dashboardPath = role === 'admin' ? '/admin' : `/${role}`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}
