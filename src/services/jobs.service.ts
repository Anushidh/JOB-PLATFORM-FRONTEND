import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { Job, JobAnalytics, PaginationParams } from '@/types';

/* ─── Types ─── */

export interface JobFilters extends PaginationParams {
  search?: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  experienceLevel?: string;
  skills?: string;
  salaryMin?: number;
  salaryMax?: number;
  following?: boolean;
  company?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  location: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  skillsRequired: string[];
  applicationDeadline?: string;
}

export type UpdateJobRequest = Partial<CreateJobRequest>;

/* ─── Service ─── */

export const jobsService = {
  getJobs: (params: JobFilters) =>
    api.get<PaginatedResponse<Job>>('/jobs', { params }),

  getJob: (jobId: string) =>
    api.get<ApiResponse<{ job: Job }>>(`/jobs/${jobId}`),

  getSimilarJobs: (jobId: string) =>
    api.get<ApiResponse<{ jobs: Job[] }>>(`/jobs/${jobId}/similar`),

  getMyJobs: (params: PaginationParams & { status?: string }) =>
    api.get<PaginatedResponse<Job>>('/jobs/employer/my-jobs', { params }),

  createJob: (data: CreateJobRequest) =>
    api.post<ApiResponse<{ job: Job }>>('/jobs', data),

  updateJob: (jobId: string, data: UpdateJobRequest) =>
    api.put<ApiResponse<{ job: Job }>>(`/jobs/${jobId}`, data),

  deleteJob: (jobId: string) =>
    api.delete<ApiResponse<null>>(`/jobs/${jobId}`),

  changeJobStatus: (jobId: string, status: string) =>
    api.patch<ApiResponse<{ job: Job }>>(`/jobs/${jobId}/status`, { status }),

  getJobQuickStats: (jobId: string) =>
    api.get<ApiResponse<{ applications: number; views: number; clicks: number }>>(`/jobs/${jobId}/stats`),

  getRecentlyViewed: () =>
    api.get<ApiResponse<{ jobs: Job[] }>>('/jobs/recently-viewed'),

  trackView: (jobId: string) =>
    api.post(`/analytics/jobs/${jobId}/view`),

  trackClick: (jobId: string) =>
    api.post(`/analytics/jobs/${jobId}/click`),

  getJobAnalytics: (jobId: string) =>
    api.get<ApiResponse<JobAnalytics>>(`/analytics/jobs/${jobId}`),

  getDashboardAnalytics: () =>
    api.get<ApiResponse<any>>('/analytics/dashboard'),
};
