import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/services/applications.service';
import { useToast } from '@/components/ui';
import { jobKeys } from './useJobs';
import type { ApplyRequest } from '@/services/applications.service';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const applicationKeys = {
  all: ['applications'] as const,
  myList: (params: any) => [...applicationKeys.all, 'my', params] as const,
  jobApplications: (jobId: string, params: any) => [...applicationKeys.all, 'job', jobId, params] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};

/* ─── Queries ─── */

export function useMyApplications(params: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: applicationKeys.myList(params),
    queryFn: async () => {
      const { data } = await applicationsService.getMyApplications(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useJobApplications(jobId: string, params: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: applicationKeys.jobApplications(jobId, params),
    queryFn: async () => {
      const { data } = await applicationsService.getJobApplications(jobId, params);
      return data;
    },
    enabled: !!jobId,
    placeholderData: (prev) => prev,
  });
}

/* ─── Mutations ─── */

export function useApplyToJob(jobId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ApplyRequest) => applicationsService.applyToJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      toast({ variant: 'success', title: 'Application submitted!' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Application failed', description: error.response?.data?.message });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (applicationId: string) => applicationsService.withdrawApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      toast({ variant: 'success', title: 'Application withdrawn' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to withdraw', description: error.response?.data?.message });
    },
  });
}

export function useUpdateApplicationStatus(jobId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ applicationId, status, note }: { applicationId: string; status: string; note?: string }) =>
      applicationsService.updateApplicationStatus(applicationId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.jobApplications(jobId, {}) });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats(jobId) });
      toast({ variant: 'success', title: 'Status updated' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Update failed', description: error.response?.data?.message });
    },
  });
}
