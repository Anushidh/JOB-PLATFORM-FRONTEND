/* ─── Enums (mirror backend) ─── */

export enum UserRole {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum WorkMode {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive',
}

export enum JobStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum ApplicationStatus {
  APPLIED = 'applied',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  WITHDRAWN = 'withdrawn',
}

export enum NotificationType {
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_STATUS_CHANGED = 'application_status_changed',
  JOB_APPROVED = 'job_approved',
  JOB_REJECTED = 'job_rejected',
  ACCOUNT_SUSPENDED = 'account_suspended',
  ACCOUNT_REACTIVATED = 'account_reactivated',
}

export enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

/* ─── Entities ─── */

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Employee {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isSuspended: boolean;
  isVerified: boolean;
  lastActiveAt?: string;
  skills?: string[];
  experience?: WorkExperience[];
  education?: Education[];
  portfolioLinks?: string[];
  resumePath?: string;
  bio?: string;
  headline?: string;
  location?: string;
  expectedSalary?: number;
  preferredJobType?: string[];
  preferredWorkMode?: string[];
  billingState?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employer {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isSuspended: boolean;
  isVerified: boolean;
  lastActiveAt?: string;
  company?: string;
  position?: string;
  department?: string;
  billingState?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  foundedYear?: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  company: Company | string;
  employer: Employer | string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  location: string;
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  status: JobStatus;
  applicationDeadline?: string;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  job: Job | string;
  applicant: Employee | string;
  coverLetter?: string;
  resumePath?: string;
  status: ApplicationStatus;
  statusHistory: StatusHistory[];
  employerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  status: ApplicationStatus;
  changedAt: string;
  note?: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  recipientRole: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{ userId: string; role: UserRole }>;
  lastMessage?: Message;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: { userId: string; role: UserRole };
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  user: string;
  userRole: string;
  plan: PlanType;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  features: {
    maxJobPosts?: number;
    maxApplications?: number;
    premiumPlacement: boolean;
    resumeAccess: boolean;
    analyticsAccess: boolean;
  };
  createdAt: string;
}

export interface JobAlert {
  _id: string;
  employee: string;
  name: string;
  filters: {
    keywords?: string[];
    location?: string;
    jobType?: string[];
    workMode?: string[];
    experienceLevel?: string[];
    salaryMin?: number;
    skills?: string[];
  };
  frequency: 'daily' | 'weekly' | 'instant';
  isActive: boolean;
  lastSentAt?: string;
  createdAt: string;
}

export interface JobAnalytics {
  views: number;
  uniqueViews: number;
  clicks: number;
  applications: number;
  dailyStats: Array<{
    date: string;
    views: number;
    clicks: number;
    applications: number;
  }>;
}

/* ─── Auth ─── */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  user: Employee | Employer;
  tokens: AuthTokens;
  role: UserRole;
}

/* ─── Pagination ─── */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
