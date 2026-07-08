import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesService } from '@/services/companies.service';
import { useToast } from '@/components/ui';
import type { CreateCompanyRequest, UpdateCompanyRequest } from '@/services/companies.service';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const companyKeys = {
  all: ['companies'] as const,
  list: (params: any) => [...companyKeys.all, 'list', params] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
  my: ['companies', 'my'] as const,
  following: (id: string) => [...companyKeys.all, 'following', id] as const,
};

/* ─── Queries ─── */

export function useCompanies(params: PaginationParams & { search?: string; industry?: string }) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: async () => {
      const { data } = await companiesService.getCompanies(params);
      return data;
    },
  });
}

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: async () => {
      const { data } = await companiesService.getCompany(companyId);
      return data.data!.company;
    },
    enabled: !!companyId,
  });
}

export function useMyCompany() {
  return useQuery({
    queryKey: companyKeys.my,
    queryFn: async () => {
      const { data } = await companiesService.getMyCompany();
      return data.data!.company;
    },
  });
}

export function useCheckFollowing(companyId: string) {
  return useQuery({
    queryKey: companyKeys.following(companyId),
    queryFn: async () => {
      const { data } = await companiesService.checkFollowing(companyId);
      return data.data!.isFollowing;
    },
    enabled: !!companyId,
  });
}

/* ─── Mutations ─── */

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companiesService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.my });
      toast({ variant: 'success', title: 'Company created!' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });
}

export function useUpdateCompany(companyId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateCompanyRequest) => companiesService.updateCompany(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.my });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(companyId) });
      toast({ variant: 'success', title: 'Company updated' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Update failed', description: error.response?.data?.message });
    },
  });
}

export function useFollowCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (companyId: string) => companiesService.followCompany(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.following(companyId) });
      toast({ variant: 'success', title: 'Following company' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to follow', description: error.response?.data?.message });
    },
  });
}

export function useUnfollowCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (companyId: string) => companiesService.unfollowCompany(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.following(companyId) });
      toast({ variant: 'success', title: 'Unfollowed company' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to unfollow', description: error.response?.data?.message });
    },
  });
}
