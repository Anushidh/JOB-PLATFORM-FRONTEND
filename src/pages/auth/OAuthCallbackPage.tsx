import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { Spinner, Text, Stack } from '@/components/ui';
import type { UserRole } from '@/types';

/**
 * Handles OAuth redirect callback.
 * The backend redirects here with accessToken, refreshToken, and role as query params.
 */
export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role') as UserRole | null;

    if (!accessToken || !refreshToken || !role) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    // Store tokens temporarily so the API interceptor can use them
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Fetch user details
    api
      .get('/auth/me')
      .then(({ data }) => {
        setAuth(data.data.user, data.data.role, { accessToken, refreshToken });
        const redirect = role === 'employer' ? '/employer' : '/employee';
        navigate(redirect, { replace: true });
      })
      .catch(() => {
        logout();
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, [searchParams, navigate, setAuth, logout]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Stack align="center" gap={4}>
        <Spinner size="lg" />
        <Text variant="body" color="secondary">
          Completing sign-in...
        </Text>
      </Stack>
    </div>
  );
}
