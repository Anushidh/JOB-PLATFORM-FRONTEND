import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { PaginationParams } from '@/types';

/* ─── Service ─── */

export const savedJobsService = {
  getSavedJobs: (params: PaginationParams) =>
    api.get<PaginatedResponse<any>>('/saved-jobs', { params }),

  saveJob: (jobId: string) =>
    api.post<ApiResponse<any>>(`/saved-jobs/${jobId}`),

  unsaveJob: (jobId: string) =>
    api.delete<ApiResponse<null>>(`/saved-jobs/${jobId}`),

  checkSaved: (jobId: string) =>
    api.get<ApiResponse<{ isSaved: boolean }>>(`/saved-jobs/${jobId}/check`),
};
