import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { Application, PaginationParams } from '@/types';

/* ─── Types ─── */

export interface ApplyRequest {
  coverLetter?: string;
  resumePath?: string;
}

/* ─── Service ─── */

export const applicationsService = {
  applyToJob: (jobId: string, data: ApplyRequest) =>
    api.post<ApiResponse<{ application: Application }>>(`/applications/jobs/${jobId}/apply`, data),

  getMyApplications: (params: PaginationParams & { status?: string }) =>
    api.get<PaginatedResponse<Application>>('/applications/my-applications', { params }),

  withdrawApplication: (applicationId: string) =>
    api.patch<ApiResponse<{ application: Application }>>(`/applications/${applicationId}/withdraw`),

  getJobApplications: (jobId: string, params: PaginationParams & { status?: string }) =>
    api.get<PaginatedResponse<Application>>(`/applications/jobs/${jobId}/applications`, { params }),

  updateApplicationStatus: (applicationId: string, status: string, note?: string) =>
    api.patch<ApiResponse<{ application: Application }>>(`/applications/${applicationId}/status`, { status, note }),

  getApplicationResumeUrl: (applicationId: string) =>
    api.get<ApiResponse<{ url: string; expiresIn: number }>>(`/applications/${applicationId}/resume`),

  getApplication: (applicationId: string) =>
    api.get<ApiResponse<{ application: Application }>>(`/applications/${applicationId}`),
};
