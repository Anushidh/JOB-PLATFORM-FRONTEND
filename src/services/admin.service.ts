import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { Employee, Employer, Job, PaginationParams } from '@/types';

/* ─── Service ─── */

export const adminService = {
  getAllEmployees: (params: PaginationParams & { search?: string }) =>
    api.get<PaginatedResponse<Employee>>('/admin/employees', { params }),

  getAllEmployers: (params: PaginationParams & { search?: string }) =>
    api.get<PaginatedResponse<Employer>>('/admin/employers', { params }),

  suspendUser: (role: string, userId: string) =>
    api.patch<ApiResponse<any>>(`/admin/users/${role}/${userId}/suspend`),

  reactivateUser: (role: string, userId: string) =>
    api.patch<ApiResponse<any>>(`/admin/users/${role}/${userId}/reactivate`),

  deleteUser: (role: string, userId: string) =>
    api.delete<ApiResponse<null>>(`/admin/users/${role}/${userId}`),

  getPendingJobs: (params: PaginationParams) =>
    api.get<PaginatedResponse<Job>>('/admin/jobs/pending', { params }),

  approveJob: (jobId: string) =>
    api.patch<ApiResponse<{ job: Job }>>(`/admin/jobs/${jobId}/approve`),

  bulkApproveJobs: (jobIds: string[]) =>
    api.patch<ApiResponse<{ jobs: Job[] }>>('/admin/jobs/bulk-approve', { jobIds }),

  rejectJob: (jobId: string, reason?: string) =>
    api.patch<ApiResponse<{ job: Job }>>(`/admin/jobs/${jobId}/reject`, { reason }),

  bulkRejectJobs: (jobIds: string[]) =>
    api.patch<ApiResponse<{ jobs: Job[] }>>('/admin/jobs/bulk-reject', { jobIds }),

  getPlatformStats: () =>
    api.get<ApiResponse<{ stats: any }>>('/admin/stats'),

  getRevenueStats: () =>
    api.get<ApiResponse<any>>('/admin/revenue'),

  getPaymentHistory: (params: PaginationParams) =>
    api.get<PaginatedResponse<any>>('/admin/revenue/payments', { params }),
};
