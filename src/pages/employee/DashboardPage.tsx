import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Container, Text, Stack, Surface, Spinner, Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useMyApplications } from '@/hooks/useApplications';
import { useProfileCompletion } from '@/hooks/useUsers';
import { api } from '@/lib/api';
import type { Application, Job, Company } from '@/types';
import { Briefcase, FileText, Bookmark, Eye, Calendar, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';

export function EmployeeDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.firstName || 'there';

  // Fetch stats
  const { data: applications } = useMyApplications({ page: 1, limit: 100 });
  const { data: completionData } = useProfileCompletion();

  const { data: savedCount } = useQuery({
    queryKey: ['saved-jobs-count'],
    queryFn: async () => {
      const { data } = await api.get('/saved-jobs', { params: { page: 1, limit: 1 } });
      return data.pagination?.total || 0;
    },
  });

  const { data: profileViews } = useQuery({
    queryKey: ['profile-views-count'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/profile-views/count');
        return data.data?.count || 0;
      } catch { return 0; }
    },
  });

  const allApps = applications?.data || [];
  const activeApps = allApps.filter(a => !['withdrawn', 'rejected'].includes(a.status));
  const interviews = allApps.filter(a => a.status === 'interview');
  const offers = allApps.filter(a => a.status === 'offer');
  const recentApps = allApps.slice(0, 5);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Container size="xl" className="py-8">
      <Stack gap={6}>
        {/* Welcome */}
        <div>
          <Text variant="h2">{greeting}, {firstName}</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Here's what's happening with your job search.
          </Text>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Briefcase />} label="Active Applications" value={activeApps.length} color="primary" />
          <StatCard icon={<Calendar />} label="Interview Invites" value={interviews.length} color="success" />
          <StatCard icon={<Bookmark />} label="Saved Jobs" value={savedCount ?? 0} color="warning" />
          <StatCard icon={<Eye />} label="Profile Views" value={profileViews ?? 0} subtext="Last 30 days" color="secondary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left - Recent Activity */}
          <Stack gap={5}>
            {/* Recent Applications */}
            <Surface variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <Text variant="h5">Recent Applications</Text>
                <Link to="/employee/applications" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="size-3" />
                </Link>
              </div>
              {recentApps.length === 0 ? (
                <div className="text-center py-6">
                  <Text variant="body-sm" color="muted">No applications yet. Start applying to jobs!</Text>
                  <Link to="/employee/jobs"><Button size="sm" className="mt-3">Browse Jobs</Button></Link>
                </div>
              ) : (
                <Stack gap={3}>
                  {recentApps.map(app => {
                    const job = app.job as Job;
                    const company = job?.company as Company;
                    const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
                      applied: 'primary', shortlisted: 'success', interview: 'success', offer: 'success', rejected: 'danger', withdrawn: 'default',
                    };
                    return (
                      <div key={app._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-neutral-100 shrink-0">
                          <Briefcase className="size-4 text-foreground-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text variant="body-sm" className="font-medium truncate">{job?.title || 'Job'}</Text>
                          <Text variant="caption" color="muted">{company?.name || 'Company'}</Text>
                        </div>
                        <Badge variant={statusColors[app.status] || 'default'} size="sm">
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                    );
                  })}
                </Stack>
              )}
            </Surface>

            {/* Offers */}
            {offers.length > 0 && (
              <Surface variant="elevated" padding="lg" className="border-l-4 border-l-success-500">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="size-5 text-success-600" />
                  <Text variant="h5">You have {offers.length} offer{offers.length > 1 ? 's' : ''}!</Text>
                </div>
                {offers.map(app => {
                  const job = app.job as Job;
                  const company = job?.company as Company;
                  return (
                    <div key={app._id} className="flex items-center gap-3 py-2">
                      <Text variant="body-sm" className="font-medium">{job?.title}</Text>
                      <Text variant="caption" color="muted">at {company?.name}</Text>
                    </div>
                  );
                })}
              </Surface>
            )}
          </Stack>

          {/* Right - Sidebar */}
          <Stack gap={4}>
            {/* Profile Completion */}
            {completionData && completionData.percentage < 100 && (
              <Surface variant="elevated" padding="md">
                <Text variant="label" className="mb-3">Profile Completion</Text>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all"
                      style={{ width: `${completionData.percentage}%` }}
                    />
                  </div>
                  <Text variant="body-sm" className="font-medium">{completionData.percentage}%</Text>
                </div>
                {completionData.missing?.length > 0 && (
                  <div className="mt-2">
                    <Text variant="caption" color="muted">Missing: {completionData.missing.slice(0, 3).join(', ')}</Text>
                  </div>
                )}
                <Link to="/employee/profile">
                  <Button variant="outline" size="xs" className="mt-3" fullWidth>Complete Profile</Button>
                </Link>
              </Surface>
            )}

            {/* Quick Actions */}
            <Surface variant="elevated" padding="md">
              <Text variant="label" className="mb-3">Quick Actions</Text>
              <Stack gap={2}>
                <Link to="/employee/jobs" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Briefcase className="size-4 text-primary-600" />
                  <Text variant="body-sm">Find Jobs</Text>
                </Link>
                <Link to="/employee/ai" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <TrendingUp className="size-4 text-primary-600" />
                  <Text variant="body-sm">AI Tools</Text>
                </Link>
                <Link to="/employee/alerts" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <FileText className="size-4 text-primary-600" />
                  <Text variant="body-sm">Job Alerts</Text>
                </Link>
              </Stack>
            </Surface>

            {/* Upcoming Interviews */}
            {interviews.length > 0 && (
              <Surface variant="elevated" padding="md">
                <Text variant="label" className="mb-3">Upcoming Interviews</Text>
                <Stack gap={2}>
                  {interviews.map(app => {
                    const job = app.job as Job;
                    return (
                      <div key={app._id} className="p-2 rounded-lg bg-success-50 border border-success-100">
                        <Text variant="body-sm" className="font-medium">{job?.title || 'Job'}</Text>
                        <Text variant="caption" color="muted">Check My Applications for details</Text>
                      </div>
                    );
                  })}
                </Stack>
              </Surface>
            )}
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
