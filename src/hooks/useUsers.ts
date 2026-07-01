import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/components/ui';
import type { UpdateEmployeeProfile, UpdateEmployerProfile, ChangePasswordRequest } from '@/services/users.service';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const userKeys = {
  profile: ['user', 'profile'] as const,
  profileCompletion: ['user', 'profile-completion'] as const,
  publicEmployee: (id: string) => ['user', 'public', 'employee', id] as const,
  publicEmployer: (id: string) => ['user', 'public', 'employer', id] as const,
  employeeSearch: (params: any) => ['user', 'search', params] as const,
};

/* ─── Queries ─── */

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: async () => {
      const { data } = await usersService.getProfile();
      return data.data!;
    },
  });
}

export function useProfileCompletion() {
  return useQuery({
    queryKey: userKeys.profileCompletion,
    queryFn: async () => {
      const { data } = await usersService.getProfileCompletion();
      return data.data!;
    },
  });
}

export function usePublicEmployeeProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.publicEmployee(userId),
    queryFn: async () => {
      const { data } = await usersService.getPublicEmployee(userId);
      return data.data!.user;
    },
    enabled: !!userId,
  });
}

export function useSearchEmployees(params: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: userKeys.employeeSearch(params),
    queryFn: async () => {
      const { data } = await usersService.searchEmployees(params);
      return data;
    },
    enabled: !!params.search,
  });
}

/* ─── Mutations ─── */

export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient();
  const { setUser, role } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateEmployeeProfile) => usersService.updateEmployeeProfile(data),
    onSuccess: (response) => {
      const updated = response.data.data!;
      setUser(updated.user, role!);
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
      queryClient.invalidateQueries({ queryKey: userKeys.profileCompletion });
      toast({ variant: 'success', title: 'Profile updated' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Update failed', description: error.response?.data?.message });
    },
  });
}

export function useUpdateEmployerProfile() {
  const queryClient = useQueryClient();
  const { setUser, role } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateEmployerProfile) => usersService.updateEmployerProfile(data),
    onSuccess: (response) => {
      const updated = response.data.data!;
      setUser(updated.user, role!);
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
      toast({ variant: 'success', title: 'Profile updated' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Update failed', description: error.response?.data?.message });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => usersService.changePassword(data),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Password changed' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });
}
