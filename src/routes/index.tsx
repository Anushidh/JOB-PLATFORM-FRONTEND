import { Routes, Route, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { UserRole } from '@/types';
import { Spinner } from '@/components/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Layouts
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Route guards
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

// Auth pages (always loaded)
import {
  LoginPage,
  RegisterPage,
  VerifyOtpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  OAuthCallbackPage,
} from '@/pages/auth';
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage';

// Lazy-loaded pages — Employee
const EmployeeDashboardPage = lazy(() => import('@/pages/employee/DashboardPage').then(m => ({ default: m.EmployeeDashboardPage })));
const EmployeeOnboardingPage = lazy(() => import('@/pages/employee/OnboardingPage').then(m => ({ default: m.EmployeeOnboardingPage })));
const JobsPage = lazy(() => import('@/pages/employee/JobsPage').then(m => ({ default: m.JobsPage })));
const JobDetailPage = lazy(() => import('@/pages/employee/JobDetailPage').then(m => ({ default: m.JobDetailPage })));
const ApplicationsPage = lazy(() => import('@/pages/employee/ApplicationsPage').then(m => ({ default: m.ApplicationsPage })));
const SavedJobsPage = lazy(() => import('@/pages/employee/SavedJobsPage').then(m => ({ default: m.SavedJobsPage })));
const JobAlertsPage = lazy(() => import('@/pages/employee/JobAlertsPage').then(m => ({ default: m.JobAlertsPage })));
const EmployeeAIToolsPage = lazy(() => import('@/pages/employee/AIToolsPage').then(m => ({ default: m.EmployeeAIToolsPage })));
const ProfilePage = lazy(() => import('@/pages/employee/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ProfileViewsPage = lazy(() => import('@/pages/employee/ProfileViewsPage').then(m => ({ default: m.ProfileViewsPage })));
const EmployeeSubscriptionPage = lazy(() => import('@/pages/employee/SubscriptionPage').then(m => ({ default: m.EmployeeSubscriptionPage })));

// Lazy-loaded pages — Employer
const EmployerDashboardPage = lazy(() => import('@/pages/employer/DashboardPage').then(m => ({ default: m.EmployerDashboardPage })));
const EmployerOnboardingPage = lazy(() => import('@/pages/employer/OnboardingPage').then(m => ({ default: m.EmployerOnboardingPage })));
const EmployerJobsPage = lazy(() => import('@/pages/employer/JobsPage').then(m => ({ default: m.EmployerJobsPage })));
const CreateJobPage = lazy(() => import('@/pages/employer/CreateJobPage').then(m => ({ default: m.CreateJobPage })));
const EmployerApplicationsPage = lazy(() => import('@/pages/employer/ApplicationsPage').then(m => ({ default: m.EmployerApplicationsPage })));
const AllApplicationsPage = lazy(() => import('@/pages/employer/AllApplicationsPage').then(m => ({ default: m.AllApplicationsPage })));
const EmployerJobDetailPage = lazy(() => import('@/pages/employer/JobDetailPage').then(m => ({ default: m.EmployerJobDetailPage })));
const CompanyPage = lazy(() => import('@/pages/employer/CompanyPage').then(m => ({ default: m.CompanyPage })));
const AnalyticsPage = lazy(() => import('@/pages/employer/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const EmployerAIToolsPage = lazy(() => import('@/pages/employer/AIToolsPage').then(m => ({ default: m.EmployerAIToolsPage })));
const SubscriptionPage = lazy(() => import('@/pages/employer/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })));
const EmployerProfilePage = lazy(() => import('@/pages/employer/ProfilePage').then(m => ({ default: m.EmployerProfilePage })));

// Lazy-loaded pages — Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage').then(m => ({ default: m.UsersPage })));
const JobModerationPage = lazy(() => import('@/pages/admin/JobModerationPage').then(m => ({ default: m.JobModerationPage })));
const RevenuePage = lazy(() => import('@/pages/admin/RevenuePage').then(m => ({ default: m.RevenuePage })));
const UserDetailPage = lazy(() => import('@/pages/admin/UserDetailPage').then(m => ({ default: m.UserDetailPage })));
const BroadcastPage = lazy(() => import('@/pages/admin/BroadcastPage').then(m => ({ default: m.BroadcastPage })));

// Lazy-loaded pages — Shared
const MessagesPage = lazy(() => import('@/pages/shared/MessagesPage').then(m => ({ default: m.MessagesPage })));
const NotificationsPage = lazy(() => import('@/pages/shared/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <Spinner size="lg" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* OAuth callback (no layout) */}
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        {/* Guest routes */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Employee routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]} />}>
          <Route path="/employee/onboarding" element={<EmployeeOnboardingPage />} />
          <Route element={<AppShell />}>
            <Route path="/employee" element={<EmployeeDashboardPage />} />
            <Route path="/employee/jobs" element={<JobsPage />} />
            <Route path="/employee/jobs/:jobId" element={<JobDetailPage />} />
            <Route path="/employee/applications" element={<ApplicationsPage />} />
            <Route path="/employee/saved" element={<SavedJobsPage />} />
            <Route path="/employee/alerts" element={<JobAlertsPage />} />
            <Route path="/employee/messages" element={<MessagesPage />} />
            <Route path="/employee/notifications" element={<NotificationsPage />} />
            <Route path="/employee/ai" element={<EmployeeAIToolsPage />} />
            <Route path="/employee/subscription" element={<EmployeeSubscriptionPage />} />
            <Route path="/employee/profile" element={<ProfilePage />} />
            <Route path="/employee/profile-views" element={<ProfileViewsPage />} />
          </Route>
        </Route>

        {/* Employer routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]} />}>
          <Route path="/employer/onboarding" element={<EmployerOnboardingPage />} />
          <Route element={<AppShell />}>
            <Route path="/employer" element={<EmployerDashboardPage />} />
            <Route path="/employer/jobs" element={<EmployerJobsPage />} />
            <Route path="/employer/jobs/new" element={<CreateJobPage />} />
            <Route path="/employer/jobs/:jobId" element={<EmployerJobDetailPage />} />
            <Route path="/employer/jobs/:jobId/applications" element={<EmployerApplicationsPage />} />
            <Route path="/employer/applications" element={<AllApplicationsPage />} />
            <Route path="/employer/company" element={<CompanyPage />} />
            <Route path="/employer/messages" element={<MessagesPage />} />
            <Route path="/employer/notifications" element={<NotificationsPage />} />
            <Route path="/employer/analytics" element={<AnalyticsPage />} />
            <Route path="/employer/ai" element={<EmployerAIToolsPage />} />
            <Route path="/employer/subscription" element={<SubscriptionPage />} />
            <Route path="/employer/profile" element={<EmployerProfilePage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route element={<AppShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/employees" element={<UsersPage userType="employees" />} />
            <Route path="/admin/employers" element={<UsersPage userType="employers" />} />
            <Route path="/admin/users/:role/:userId" element={<UserDetailPage />} />
            <Route path="/admin/jobs" element={<JobModerationPage />} />
            <Route path="/admin/revenue" element={<RevenuePage />} />
            <Route path="/admin/broadcast" element={<BroadcastPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
