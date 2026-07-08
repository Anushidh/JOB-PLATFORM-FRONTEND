import { useQuery } from '@tanstack/react-query';
import {
  Container, Stack, Text, Surface, Grid, Spinner,
} from '@/components/ui';
import { jobsService } from '@/services/jobs.service';
import { BarChart3, Eye, MousePointer, Users, TrendingUp } from 'lucide-react';

export function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['employer-dashboard-analytics'],
    queryFn: async () => {
      const { data } = await jobsService.getDashboardAnalytics();
      return data.data;
    },
  });

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Analytics</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Track performance across all your job listings
          </Text>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !analytics ? (
          <Surface variant="outlined" padding="lg">
            <Stack align="center" gap={2} className="py-8">
              <BarChart3 className="size-12 text-foreground-muted stroke-[1.5]" />
              <Text variant="subtitle" color="secondary">No analytics data yet</Text>
              <Text variant="body-sm" color="muted">Post jobs and data will appear here as candidates interact.</Text>
            </Stack>
          </Surface>
        ) : (
          <Stack gap={6}>
            <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Eye />} label="Total Views" value={analytics.totalViews ?? 0} />
              <StatCard icon={<MousePointer />} label="Total Clicks" value={analytics.totalClicks ?? 0} />
              <StatCard icon={<Users />} label="Total Applications" value={analytics.totalApplications ?? 0} />
              <StatCard icon={<TrendingUp />} label="Conversion Rate" value={`${analytics.conversionRate ?? 0}%`} />
            </Grid>

            {analytics.jobStats && analytics.jobStats.length > 0 && (
              <Surface variant="elevated" padding="lg">
                <Text variant="h5" className="mb-4">Per-Job Breakdown</Text>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 pr-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider whitespace-nowrap">Job Title</th>
                        <th className="pb-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right whitespace-nowrap">Views</th>
                        <th className="pb-3 px-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right whitespace-nowrap">Clicks</th>
                        <th className="pb-3 pl-4 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right whitespace-nowrap">Applications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.jobStats.map((stat: any) => (
                        <tr key={stat.jobId} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4"><Text variant="body-sm" className="font-medium min-w-[200px] block">{stat.title}</Text></td>
                          <td className="py-3 px-4 text-right"><Text variant="body-sm" color="secondary">{stat.views}</Text></td>
                          <td className="py-3 px-4 text-right"><Text variant="body-sm" color="secondary">{stat.clicks}</Text></td>
                          <td className="py-3 pl-4 text-right"><Text variant="body-sm" className="font-medium">{stat.applications}</Text></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Surface>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Surface variant="elevated" padding="md">
      <Stack gap={3}>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 [&>svg]:size-[18px]">
          {icon}
        </div>
        <div>
          <Text variant="h3" className="tabular-nums">{value}</Text>
          <Text variant="body-sm" color="secondary">{label}</Text>
        </div>
      </Stack>
    </Surface>
  );
}
