import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { jobsService } from '@/services/jobs.service';
import { useToast } from '@/components/ui';
import type { JobFilters, CreateJobRequest, UpdateJobRequest } from '@/services/jobs.service';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  similar: (id: string) => [...jobKeys.all, 'similar', id] as const,
  employer: () => [...jobKeys.all, 'employer'] as const,
  employerList: (params: any) => [...jobKeys.employer(), params] as const,
  stats: (id: string) => [...jobKeys.all, 'stats', id] as const,
  recentlyViewed: () => [...jobKeys.all, 'recently-viewed'] as const,
  analytics: (id: string) => [...jobKeys.all, 'analytics', id] as const,
  dashboardAnalytics: () => [...jobKeys.all, 'dashboard-analytics'] as const,
};

/* ─── Queries ─── */

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: async () => {
      const { data } = await jobsService.getJobs(filters);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.detail(jobId!),
    queryFn: async () => {
      const { data } = await jobsService.getJob(jobId!);
      return data.data!.job;
    },
    enabled: !!jobId,
  });
}

export function useSimilarJobs(jobId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.similar(jobId!),
    queryFn: async () => {
      const { data } = await jobsService.getSimilarJobs(jobId!);
      return data.data!.jobs;
    },
    enabled: !!jobId,
  });
}

export function useEmployerJobs(params: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: jobKeys.employerList(params),
    queryFn: async () => {
      const { data } = await jobsService.getMyJobs(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useJobQuickStats(jobId: string) {
  return useQuery({
    queryKey: jobKeys.stats(jobId),
    queryFn: async () => {
      const { data } = await jobsService.getJobQuickStats(jobId);
      return data.data!;
    },
    enabled: !!jobId,
  });
}

export function useRecentlyViewedJobs() {
  return useQuery({
    queryKey: jobKeys.recentlyViewed(),
    queryFn: async () => {
      const { data } = await jobsService.getRecentlyViewed();
      return data.data!.jobs;
    },
  });
}

export function useJobAnalytics(jobId: string) {
  return useQuery({
    queryKey: jobKeys.analytics(jobId),
    queryFn: async () => {
      const { data } = await jobsService.getJobAnalytics(jobId);
      return data.data!;
    },
    enabled: !!jobId,
  });
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: jobKeys.dashboardAnalytics(),
    queryFn: async () => {
      const { data } = await jobsService.getDashboardAnalytics();
      return data.data;
    },
  });
}

/* ─── Mutations ─── */

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateJobRequest) => jobsService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.employer() });
      toast({ variant: 'success', title: 'Job posted!', description: 'Your listing is pending review.' });
      navigate('/employer/jobs');
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to post job', description: error.response?.data?.message });
    },
  });
}

export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateJobRequest) => jobsService.updateJob(jobId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.employer() });
      queryClient.setQueryData(jobKeys.detail(jobId), response.data.data!.job);
      toast({ variant: 'success', title: 'Job updated' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Update failed', description: error.response?.data?.message });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => jobsService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.employer() });
      toast({ variant: 'success', title: 'Job deleted' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Delete failed', description: error.response?.data?.message });
    },
  });
}

export function useChangeJobStatus(jobId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (status: string) => jobsService.changeJobStatus(jobId, status),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.employer() });
      queryClient.setQueryData(jobKeys.detail(jobId), response.data.data!.job);
      toast({ variant: 'success', title: 'Status updated' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });
}
