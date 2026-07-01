import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { Employee, Employer, PaginationParams } from '@/types';

/* ─── Types ─── */

export interface UpdateEmployeeProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  headline?: string;
  location?: string;
  expectedSalary?: number;
  skills?: string[];
  preferredJobType?: string[];
  preferredWorkMode?: string[];
  portfolioLinks?: string[];
  billingState?: string;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
}

export interface UpdateEmployerProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  department?: string;
  billingState?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/* ─── Service ─── */

export const usersService = {
  getProfile: () =>
    api.get<ApiResponse<{ user: Employee | Employer; role: string }>>('/users/profile'),

  getProfileCompletion: () =>
    api.get<ApiResponse<{ percentage: number; missing: string[] }>>('/users/profile-completion'),

  updateEmployeeProfile: (data: UpdateEmployeeProfile) =>
    api.put<ApiResponse<{ user: Employee; role: string }>>('/users/profile/employee', data),

  updateEmployerProfile: (data: UpdateEmployerProfile) =>
    api.put<ApiResponse<{ user: Employer; role: string }>>('/users/profile/employer', data),

  changePassword: (data: ChangePasswordRequest) =>
    api.patch<ApiResponse<null>>('/users/change-password', data),

  getPublicEmployee: (userId: string) =>
    api.get<ApiResponse<{ user: Employee }>>(`/users/employees/${userId}/public`),

  getPublicEmployer: (userId: string) =>
    api.get<ApiResponse<{ user: Employer }>>(`/users/employers/${userId}/public`),

  searchEmployees: (params: PaginationParams & { search?: string }) =>
    api.get<PaginatedResponse<Employee>>('/users/employees/search', { params }),
};
