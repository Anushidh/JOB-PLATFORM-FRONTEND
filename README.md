# HireFlow — Frontend

A modern, full-featured job platform frontend built with React, TypeScript, and Tailwind CSS. Supports three user roles: Job Seekers (Employees), Employers, and Admins.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (design tokens)
- **Routing:** React Router v7
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Forms:** React Hook Form + Zod
- **UI Components:** Custom component library (Surface, Input, Select, Modal, Tabs, etc.)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Payments:** Razorpay Web SDK

## Getting Started

```bash
cd job-platform-frontend
npm install
cp .env.example .env   # Add your Razorpay key
npm run dev            # Starts on http://localhost:5173
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_RAZORPAY_KEY_ID` | Razorpay test/live key for payments |

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppShell, Sidebar, AuthLayout
│   ├── ui/              # Reusable UI components (Input, Button, Modal, Surface, etc.)
│   └── NewMessageModal  # Shared message composer
├── hooks/               # React Query hooks (useJobs, useApplications, useUsers, etc.)
├── lib/                 # API client, utilities, socket.io
├── pages/
│   ├── auth/            # Login, Register, OTP, Forgot/Reset Password, OAuth
│   ├── employee/        # Dashboard, Jobs, Applications, Saved, Alerts, AI Tools, Profile, Subscription
│   ├── employer/        # Dashboard, Jobs, Applications, Company, Analytics, AI Tools, Subscription, Profile
│   ├── admin/           # Dashboard, Users, Job Moderation, Revenue, Broadcast
│   └── shared/          # Messages, Notifications
├── routes/              # Route definitions, guards (ProtectedRoute, GuestRoute)
├── services/            # API service layer (jobs, applications, users, messages, etc.)
├── stores/              # Zustand stores (auth, jobDraft, coverLetterDraft)
├── styles/              # Global CSS, design tokens
└── types/               # TypeScript interfaces
```

## Features by Role

### Job Seeker (Employee)

| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time stats (applications, interviews, saved jobs, profile views), recent activity, profile completion |
| **Find Jobs** | Search/filter jobs by keyword, location, type, mode, experience, salary |
| **Job Detail** | Full job info, Quick Apply, Apply with Cover Letter (AI-generated), save, share |
| **My Applications** | Track all applications with status badges, interview details card (date, time, location/link) |
| **Saved Jobs** | Bookmark jobs for later (tiered limits) |
| **Job Alerts** | Create alerts with filters (keywords, skills, location, job type, work mode, experience), daily/weekly/instant |
| **Messages** | Read/reply to employer messages |
| **AI Tools** | Resume Parser (PDF → profile), Cover Letter Generator, Match Score (skill/experience/location breakdown) |
| **Profile** | 6 tabs: Personal Info, Professional, Experience (CRUD), Education (CRUD), Job Preferences, Security |
| **Subscription** | View plans, upgrade via Razorpay (Basic/Premium/Enterprise) |
| **Notifications** | In-app notifications for status changes, messages, etc. |

### Employer

| Feature | Description |
|---------|-------------|
| **Dashboard** | Stats (active jobs, applicants, views, this week), top jobs, recent applications, quick actions |
| **My Jobs** | List/manage posted jobs, status badges |
| **Post a Job** | Full form with validation; AI-generated descriptions auto-fill via Zustand |
| **Applications** | Per-job applicant list, Priority badges, status flow (Applied → Shortlisted → Interview → Offer/Rejected) |
| **Schedule Interview** | Modal with date/time, type (video/in-person/phone), meeting link (paste or generate Jitsi), notes |
| **Company** | Create/edit company profile with logo |
| **Messages** | Message applicants, recipient picker from applicant pool |
| **Analytics** | Job performance metrics (views, clicks, applications) |
| **AI Tools** | Job Description Generator (→ Create Job flow), Applicant Match Score (select job + applicant) |
| **Subscription** | Manage plan, Razorpay payments, cancel |
| **Profile** | Edit personal info, change password |

### Admin

| Feature | Description |
|---------|-------------|
| **Dashboard** | Platform-wide stats |
| **Job Seekers** | List, view, suspend/reactivate, delete employees |
| **Employers** | List, view, suspend/reactivate, delete employers |
| **Job Moderation** | Approve/reject pending job listings (per-item loading states) |
| **Revenue** | Revenue dashboard, payment history |
| **Broadcast** | Send notifications to all users |

## Key UI Patterns

- **Zustand stores** for cross-page data flow (AI → Create Job, AI → Apply with Cover Letter)
- **React Query** for server state with optimistic updates and cache invalidation
- **Modal-based flows** (Apply, Schedule Interview, New Message, Create Alert)
- **Inline validation** with Zod schemas and error messages
- **Skeleton loading** and empty states throughout
- **Toast notifications** (z-index 9999 to appear above modals)
- **Auto-scroll** to new content (add entry, check match results)
- **Responsive design** — mobile-friendly with collapsible sidebar

## Scripts

```bash
npm run dev       # Development server (HMR)
npm run build     # TypeScript check + Vite build
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Design Tokens

All design values (colors, spacing, shadows, z-indexes, transitions) are defined in `src/styles/tokens.css` using CSS custom properties inside `@theme`, making them available as Tailwind utilities.

## License

ISC
