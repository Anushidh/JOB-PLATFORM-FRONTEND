import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedJobsService } from '@/services/saved-jobs.service';
import { useToast } from '@/components/ui';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const savedJobKeys = {
  all: ['saved-jobs'] as const,
  list: (params: any) => [...savedJobKeys.all, 'list', params] as const,
  check: (jobId: string) => [...savedJobKeys.all, 'check', jobId] as const,
};

/* ─── Queries ─── */

export function useSavedJobs(params: PaginationParams) {
  return useQuery({
    queryKey: savedJobKeys.list(params),
    queryFn: async () => {
      const { data } = await savedJobsService.getSavedJobs(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCheckSaved(jobId: string | undefined) {
  return useQuery({
    queryKey: savedJobKeys.check(jobId!),
    queryFn: async () => {
      const { data } = await savedJobsService.checkSaved(jobId!);
      return data.data!.isSaved;
    },
    enabled: !!jobId,
  });
}

/* ─── Mutations ─── */

export function useSaveJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => savedJobsService.saveJob(jobId),
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: savedJobKeys.all });
      queryClient.setQueryData(savedJobKeys.check(jobId), true);
      toast({ variant: 'success', title: 'Job saved!' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to save', description: error.response?.data?.message });
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => savedJobsService.unsaveJob(jobId),
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: savedJobKeys.all });
      queryClient.setQueryData(savedJobKeys.check(jobId), false);
      toast({ variant: 'info', title: 'Job removed from saved' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });
}
