# Job Platform Frontend - Development Memory

## Status: Feature Complete ✅

## Architecture

```
src/
├── lib/              → api.ts (axios + interceptors + token refresh), utils.ts (cn helper)
├── services/         → Pure API call functions (no React, no hooks)
├── hooks/            → Custom React Query hooks (queries + mutations + cache invalidation)
├── stores/           → Zustand global state (auth only)
├── components/
│   ├── ui/           → Design system components (18 components)
│   ├── layout/       → App shell, sidebar, topbar, auth layout
│   └── ErrorBoundary → Global error boundary
├── pages/            → Route-level page components (all features)
├── routes/           → Router config + guards (protected, guest)
├── styles/           → globals.css + tokens.css (design tokens)
└── types/            → TypeScript types mirroring backend enums & entities
```

## Backend → Frontend Coverage Map

| Backend Route Module | Frontend Pages | Status |
|---|---|---|
| `/auth/*` | Login, Register, VerifyOTP, ForgotPassword, ResetPassword | ✅ |
| `/auth/oauth/*` | OAuthCallbackPage | ✅ |
| `/users/profile` | Employee ProfilePage, Employer ProfilePage | ✅ |
| `/users/profile-completion` | Profile badge (both roles) | ✅ |
| `/users/change-password` | Security tab (both roles) | ✅ |
| `/users/resume` | Upload in Employee ProfilePage | ✅ |
| `/users/employees/:id/public` | Used in applicant cards | ✅ |
| `/users/employers/:id/public` | Available via service | ✅ |
| `/users/employees/search` | Available via hook | ✅ |
| `/jobs` (CRUD, search, filters) | JobsPage, JobDetail, CreateJob, EmployerJobs | ✅ |
| `/jobs/recently-viewed` | Available via hook | ✅ |
| `/jobs/:id/similar` | JobDetailPage sidebar | ✅ |
| `/jobs/:id/stats` | EmployerJobsPage stats | ✅ |
| `/applications/*` | Employee ApplicationsPage, Employer ApplicationsPage | ✅ |
| `/companies/*` | CompanyPage (create/edit) | ✅ |
| `/admin/employees` | Admin UsersPage | ✅ |
| `/admin/employers` | Admin UsersPage | ✅ |
| `/admin/users/:role/:id/suspend` | Admin UsersPage dropdown | ✅ |
| `/admin/users/:role/:id/reactivate` | Admin UsersPage dropdown | ✅ |
| `/admin/users/:role/:id` (delete) | Admin UsersPage dropdown | ✅ |
| `/admin/jobs/pending` | Admin JobModerationPage | ✅ |
| `/admin/jobs/:id/approve` | Admin JobModerationPage | ✅ |
| `/admin/jobs/:id/reject` | Admin JobModerationPage | ✅ |
| `/admin/stats` | Admin DashboardPage | ✅ |
| `/admin/revenue` | Admin RevenuePage | ✅ |
| `/admin/revenue/payments` | Admin RevenuePage table | ✅ |
| `/notifications/*` | NotificationsPage (both roles) | ✅ |
| `/uploads/avatar` | Employee/Employer profile pages | ✅ |
| `/uploads/company-logo` | CompanyPage (via service) | ✅ |
| `/uploads/resume` | Employee ProfilePage | ✅ |
| `/saved-jobs/*` | SavedJobsPage + JobDetail save/unsave | ✅ |
| `/messages/*` | MessagesPage (shared, both roles) | ✅ |
| `/analytics/*` | Employer AnalyticsPage | ✅ |
| `/subscriptions/*` | Employer SubscriptionPage | ✅ |
| `/job-alerts/*` | Employee JobAlertsPage (CRUD + toggle) | ✅ |
| `/ai/parse-resume` | Employee AIToolsPage | ✅ |
| `/ai/apply-parsed-resume` | Employee AIToolsPage | ✅ |
| `/ai/generate-cover-letter` | Employee AIToolsPage | ✅ |
| `/ai/match-score/:jobId` | Employee AIToolsPage | ✅ |
| `/ai/generate-job-description` | Employer AIToolsPage | ✅ |
| `/ai/applicant-match/:jobId/:applicantId` | Employer AIToolsPage | ✅ |
| `/profile-views/count` | Employee ProfileViewsPage | ✅ |
| `/profile-views/viewers` | Employee ProfileViewsPage (Premium-gated) | ✅ |
| `/company-follows/*` | JobDetail company card (follow/unfollow via service) | ✅ |

## All Routes (zero placeholders)

### Employee (9 routes)
- `/employee` — Dashboard
- `/employee/jobs` — Job listing with search & filters
- `/employee/jobs/:jobId` — Job detail (save, apply, similar)
- `/employee/applications` — My applications (status, withdraw)
- `/employee/saved` — Saved jobs
- `/employee/alerts` — Job alerts (CRUD, toggle, create modal)
- `/employee/messages` — Messaging
- `/employee/notifications` — Notifications
- `/employee/ai` — AI tools (resume parser, cover letter, match score)
- `/employee/profile` — Profile (personal, professional, security tabs + avatar/resume upload)
- `/employee/profile-views` — Profile views (count + viewers list)

### Employer (10 routes)
- `/employer` — Dashboard
- `/employer/jobs` — My jobs list
- `/employer/jobs/new` — Create job form
- `/employer/jobs/:jobId/applications` — Applicant management
- `/employer/company` — Company create/edit
- `/employer/messages` — Messaging
- `/employer/notifications` — Notifications
- `/employer/analytics` — Analytics dashboard
- `/employer/ai` — AI tools (job desc generator, applicant match)
- `/employer/subscription` — Plans, current plan, upgrade/cancel
- `/employer/profile` — Profile & password settings

### Admin (5 routes)
- `/admin` — Dashboard
- `/admin/employees` — User management table
- `/admin/employers` — User management table
- `/admin/jobs` — Job moderation (approve/reject)
- `/admin/revenue` — Revenue stats + payment history

### Auth (5 routes)
- `/login` — Tabbed login + OAuth
- `/register` — Employee/Employer registration
- `/verify-otp` — 6-digit OTP verification
- `/forgot-password` — Request reset code
- `/reset-password` — Set new password

### Other
- `/oauth/callback` — OAuth token handler
- `*` — 404 page

## Tech Stack
- React 19 + TypeScript (strict)
- Vite 8 + Tailwind CSS v4 (canonical syntax)
- TanStack React Query (queries + mutations + invalidation)
- React Router v6 (lazy routes + code-splitting)
- React Hook Form + Zod validation
- Zustand (auth store only)
- Framer Motion (modals, toasts, dropdowns)
- CVA + clsx + tailwind-merge (component variants)
- Axios (interceptors, auto token refresh)
- Lucide React (icons)

## Design System
- 18 UI components (Button, Input, Textarea, Select, Checkbox, Radio, Badge, Avatar, Spinner, Skeleton, Modal, Toast, Dropdown, Tabs, EmptyState, Surface, Typography, Layout primitives)
- Token-driven (colors, spacing, radius, shadows, typography, motion)
- Tailwind v4 canonical class syntax (no arbitrary values)
- 8-point spacing system
- Accessible (ARIA, focus-visible, keyboard nav)
- Error boundary at app root

## Services (9 modules)
auth, jobs, applications, saved-jobs, users, notifications, messages, companies, admin

## Hooks (9 modules)
useAuth, useJobs, useApplications, useSavedJobs, useUsers, useNotifications, useMessages, useCompanies, useAdmin
