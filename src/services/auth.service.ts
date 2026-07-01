import { api, type ApiResponse } from '@/lib/api';
import type { AuthTokens, Employee, Employer, UserRole } from '@/types';

/* ─── Types ─── */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface EmployeeRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  skills?: string[];
  bio?: string;
  headline?: string;
  location?: string;
}

export interface EmployerRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position?: string;
  department?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
  role: 'employee' | 'employer';
}

export interface ResetPasswordRequest {
  email: string;
  role: 'employee' | 'employer';
  otp: string;
  newPassword: string;
}

export interface AuthData {
  user: Employee | Employer;
  tokens: AuthTokens;
  role: UserRole;
}

export interface InitiateData {
  email: string;
  expiresIn: number;
}

/* ─── Service ─── */

export const authService = {
  initiateEmployeeRegistration: (data: EmployeeRegisterRequest) =>
    api.post<ApiResponse<InitiateData>>('/auth/employee/register', data),

  initiateEmployerRegistration: (data: EmployerRegisterRequest) =>
    api.post<ApiResponse<InitiateData>>('/auth/employer/register', data),

  verifyEmployeeOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<AuthData>>('/auth/employee/verify-otp', data),

  verifyEmployerOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<AuthData>>('/auth/employer/verify-otp', data),

  loginEmployee: (data: LoginRequest) =>
    api.post<ApiResponse<AuthData>>('/auth/employee/login', data),

  loginEmployer: (data: LoginRequest) =>
    api.post<ApiResponse<AuthData>>('/auth/employer/login', data),

  loginAdmin: (data: LoginRequest) =>
    api.post<ApiResponse<AuthData>>('/auth/admin/login', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<InitiateData>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<null>>('/auth/reset-password', data),

  me: () =>
    api.get<ApiResponse<{ user: Employee | Employer; role: UserRole }>>('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh-token', { refreshToken }),
};
