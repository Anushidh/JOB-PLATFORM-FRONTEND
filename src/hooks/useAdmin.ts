import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const adminKeys = {
  employees: (params: any) => ['admin', 'employees', params] as const,
  employers: (params: any) => ['admin', 'employers', params] as const,
  pendingJobs: (params: any) => ['admin', 'pending-jobs', params] as const,
  stats: ['admin', 'stats'] as const,
  revenue: ['admin', 'revenue'] as const,
  payments: (params: any) => ['admin', 'payments', params] as const,
};

/* ─── Queries ─── */

export function useAdminEmployees(params: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: adminKeys.employees(params),
    queryFn: async () => {
      const { data } = await adminService.getAllEmployees(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminEmployers(params: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: adminKeys.employers(params),
    queryFn: async () => {
      const { data } = await adminService.getAllEmployers(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function usePendingJobs(params: PaginationParams) {
  return useQuery({
    queryKey: adminKeys.pendingJobs(params),
    queryFn: async () => {
      const { data } = await adminService.getPendingJobs(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await adminService.getPlatformStats();
      return data.data!.stats;
    },
  });
}

export function useRevenueStats() {
  return useQuery({
    queryKey: adminKeys.revenue,
    queryFn: async () => {
      const { data } = await adminService.getRevenueStats();
      return data.data;
    },
  });
}

/* ─── Mutations ─── */

export function useSuspendUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ role, userId }: { role: string; userId: string }) =>
      adminService.suspendUser(role, userId),
    onSuccess: (_data, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', role === 'employee' ? 'employees' : 'employers'] });
      toast({ variant: 'warning', title: 'User suspended' });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ role, userId }: { role: string; userId: string }) =>
      adminService.reactivateUser(role, userId),
    onSuccess: (_data, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', role === 'employee' ? 'employees' : 'employers'] });
      toast({ variant: 'success', title: 'User reactivated' });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ role, userId }: { role: string; userId: string }) =>
      adminService.deleteUser(role, userId),
    onSuccess: (_data, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', role === 'employee' ? 'employees' : 'employers'] });
      toast({ variant: 'info', title: 'User deleted' });
    },
  });
}

export function useApproveJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => adminService.approveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
      toast({ variant: 'success', title: 'Job approved' });
    },
  });
}

export function useRejectJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      adminService.rejectJob(jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-jobs'] });
      toast({ variant: 'info', title: 'Job rejected' });
    },
  });
}
