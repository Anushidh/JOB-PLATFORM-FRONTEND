import { create } from 'zustand';
import type { Employee, Employer, UserRole, AuthTokens } from '@/types';

interface AuthState {
  user: Employee | Employer | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: Employee | Employer, role: UserRole, tokens: AuthTokens) => void;
  setUser: (user: Employee | Employer, role: UserRole) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, role, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('userRole', role);
    set({ user, role, isAuthenticated: true, isLoading: false });
  },

  setUser: (user, role) => {
    set({ user, role, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    set({ user: null, role: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
