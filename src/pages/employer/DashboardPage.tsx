import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Container, Text, Stack, Surface, Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { jobsService } from '@/services/jobs.service';
import { api } from '@/lib/api';
import type { Job, Company } from '@/types';
import { Briefcase, Users, Eye, TrendingUp, ArrowRight, Plus, FileText, BarChart3, MessageSquare } from 'lucide-react';

export function EmployerDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.firstName || 'there';

  // Fetch jobs
  const { data: jobsData } = useQuery({
    queryKey: ['employer-dashboard-jobs'],
    queryFn: async () => {
      const { data } = await jobsService.getMyJobs({ page: 1, limit: 50 });
      return data;
    },
  });

  // Fetch dashboard analytics
  const { data: analytics } = useQuery({
    queryKey: ['employer-dashboard-analytics'],
    queryFn: async () => {
      try {
        const { data } = await jobsService.getDashboardAnalytics();
        return data.data;
      } catch { return null; }
    },
  });

  // Fetch recent applications across all jobs
  const { data: recentApps } = useQuery({
    queryKey: ['employer-recent-applications'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/applications/employer/recent', { params: { limit: 5 } });
        return data.data || [];
      } catch { return []; }
    },
  });

  const allJobs = jobsData?.data || [];
  const activeJobs = allJobs.filter((j: Job) => j.status === 'active');
  const totalApplicants = allJobs.reduce((sum: number, j: Job) => sum + (j.applicationsCount || 0), 0);
  const totalViews = analytics?.totalViews || 0;
  const thisWeekApps = analytics?.thisWeekApplications || 0;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Container size="xl" className="py-8">
      <Stack gap={6}>
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2">{greeting}, {firstName}</Text>
            <Text variant="body" color="secondary" className="mt-1">
              Here's an overview of your hiring activity.
            </Text>
          </div>
          <Link to="/employer/jobs/new">
            <Button leftIcon={<Plus />}>Post a Job</Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Briefcase />} label="Active Jobs" value={activeJobs.length} color="primary" />
          <StatCard icon={<Users />} label="Total Applicants" value={totalApplicants} color="success" />
          <StatCard icon={<Eye />} label="Total Views" value={totalViews} color="warning" />
          <StatCard icon={<TrendingUp />} label="This Week" value={thisWeekApps} subtext="New applications" color="secondary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left - Main content */}
          <Stack gap={5}>
            {/* Active Jobs */}
            <Surface variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <Text variant="h5">Your Jobs</Text>
                <Link to="/employer/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="size-3" />
                </Link>
              </div>
              {activeJobs.length === 0 ? (
                <div className="text-center py-6">
                  <Text variant="body-sm" color="muted">No active jobs. Post your first job to start hiring!</Text>
                  <Link to="/employer/jobs/new"><Button size="sm" className="mt-3" leftIcon={<Plus />}>Post a Job</Button></Link>
                </div>
              ) : (
                <Stack gap={3}>
                  {activeJobs.slice(0, 5).map((job: Job) => (
                    <Link key={job._id} to={`/employer/jobs/${job._id}/applications`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50 shrink-0">
                        <Briefcase className="size-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text variant="body-sm" className="font-medium truncate">{job.title}</Text>
                        <Text variant="caption" color="muted">{job.location} · {job.workMode}</Text>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" size="sm">
                          <Users className="size-3 mr-1" />{job.applicationsCount}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </Stack>
              )}
            </Surface>

            {/* Recent Applications */}
            {recentApps && recentApps.length > 0 && (
              <Surface variant="elevated" padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="h5">Recent Applications</Text>
                  <Link to="/employer/applications" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                    View all <ArrowRight className="size-3" />
                  </Link>
                </div>
                <Stack gap={3}>
                  {recentApps.map((app: any) => {
                    const applicant = app.applicant;
                    const job = app.job;
                    return (
                      <div key={app._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-success-50 shrink-0">
                          <FileText className="size-4 text-success-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text variant="body-sm" className="font-medium truncate">
                            {applicant?.firstName} {applicant?.lastName}
                          </Text>
                          <Text variant="caption" color="muted">Applied to {job?.title}</Text>
                        </div>
                        <Text variant="caption" color="muted">
                          {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </div>
                    );
                  })}
                </Stack>
              </Surface>
            )}
          </Stack>

          {/* Right - Sidebar */}
          <Stack gap={4}>
            {/* Quick Actions */}
            <Surface variant="elevated" padding="md">
              <Text variant="label" className="mb-3">Quick Actions</Text>
              <Stack gap={2}>
                <Link to="/employer/jobs/new" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Plus className="size-4 text-primary-600" />
                  <Text variant="body-sm">Post a Job</Text>
                </Link>
                <Link to="/employer/applications" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <FileText className="size-4 text-primary-600" />
                  <Text variant="body-sm">Review Applications</Text>
                </Link>
                <Link to="/employer/analytics" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <BarChart3 className="size-4 text-primary-600" />
                  <Text variant="body-sm">View Analytics</Text>
                </Link>
                <Link to="/employer/messages" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <MessageSquare className="size-4 text-primary-600" />
                  <Text variant="body-sm">Messages</Text>
                </Link>
              </Stack>
            </Surface>

            {/* Job Performance Summary */}
            {activeJobs.length > 0 && (
              <Surface variant="elevated" padding="md">
                <Text variant="label" className="mb-3">Top Performing Jobs</Text>
                <Stack gap={2}>
                  {[...activeJobs]
                    .sort((a: Job, b: Job) => (b.applicationsCount || 0) - (a.applicationsCount || 0))
                    .slice(0, 3)
                    .map((job: Job) => (
                      <div key={job._id} className="flex items-center justify-between p-2">
                        <Text variant="body-sm" className="truncate flex-1 mr-2">{job.title}</Text>
                        <Badge variant="primary" size="sm">{job.applicationsCount} apps</Badge>
                      </div>
                    ))}
                </Stack>
              </Surface>
            )}

            {/* Hiring Tips */}
            <Surface variant="flat" padding="md" className="border border-border bg-primary-50/30">
              <Text variant="label" className="mb-2 text-primary-700">💡 Hiring Tip</Text>
              <Text variant="body-sm" color="secondary">
                Jobs with detailed descriptions get 3x more applications. Use AI Tools to generate compelling job descriptions.
              </Text>
              <Link to="/employer/ai">
                <Button variant="ghost" size="xs" className="mt-2 text-primary-600">Try AI Tools →</Button>
              </Link>
            </Surface>
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color = 'primary',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  color?: 'primary' | 'success' | 'warning' | 'secondary';
}) {
  const bgColors = { primary: 'bg-primary-50 text-primary-600', success: 'bg-success-50 text-success-600', warning: 'bg-warning-50 text-warning-600', secondary: 'bg-neutral-100 text-foreground-secondary' };
  return (
    <Surface variant="elevated" padding="md">
      <Stack gap={3}>
        <div className={`flex size-9 items-center justify-center rounded-lg ${bgColors[color]} [&>svg]:size-[18px]`}>
          {icon}
        </div>
        <div>
          <Text variant="h3" className="tabular-nums">{value}</Text>
          <Text variant="body-sm" color="secondary">{label}</Text>
          {subtext && <Text variant="caption" color="muted" className="mt-0-5">{subtext}</Text>}
        </div>
      </Stack>
    </Surface>
  );
}
