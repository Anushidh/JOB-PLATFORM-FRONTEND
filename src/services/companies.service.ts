import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { Company, PaginationParams } from '@/types';

/* ─── Types ─── */

export interface CreateCompanyRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  foundedYear?: number;
}

export type UpdateCompanyRequest = Partial<CreateCompanyRequest>;

/* ─── Service ─── */

export const companiesService = {
  getCompanies: (params: PaginationParams & { search?: string; industry?: string }) =>
    api.get<PaginatedResponse<Company>>('/companies', { params }),

  getCompany: (companyId: string) =>
    api.get<ApiResponse<{ company: Company }>>(`/companies/${companyId}`),

  getMyCompany: () =>
    api.get<ApiResponse<{ company: Company | null }>>('/companies/my/company'),

  createCompany: (data: CreateCompanyRequest) =>
    api.post<ApiResponse<{ company: Company }>>('/companies', data),

  updateCompany: (companyId: string, data: UpdateCompanyRequest) =>
    api.put<ApiResponse<{ company: Company }>>(`/companies/${companyId}`, data),

  deleteCompany: (companyId: string) =>
    api.delete<ApiResponse<null>>(`/companies/${companyId}`),

  // Company Follows
  followCompany: (companyId: string) =>
    api.post<ApiResponse<any>>(`/company-follows/${companyId}/follow`),

  unfollowCompany: (companyId: string) =>
    api.delete<ApiResponse<any>>(`/company-follows/${companyId}/follow`),

  checkFollowing: (companyId: string) =>
    api.get<ApiResponse<{ isFollowing: boolean }>>(`/company-follows/${companyId}/check`),

  getFollowerCount: (companyId: string) =>
    api.get<ApiResponse<{ count: number }>>(`/company-follows/${companyId}/followers/count`),

  getFollowedCompanies: () =>
    api.get<ApiResponse<{ companies: Array<{ _id: string; company: Company; createdAt: string }> }>>('/company-follows/my/following'),
};
