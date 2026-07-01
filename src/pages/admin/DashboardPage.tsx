import { useQuery } from '@tanstack/react-query';
import { Container, Text, Stack, Surface, Grid, Spinner } from '@/components/ui';
import { adminService } from '@/services/admin.service';
import { Users, Briefcase, CreditCard, Shield } from 'lucide-react';

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      const { data } = await adminService.getPlatformStats();
      return data.data!.stats;
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: async () => {
      const { data } = await adminService.getRevenueStats();
      return data.data;
    },
  });

  const revenueByMonth = revenueData?.revenueByMonth || [];

  return (
    <Container size="xl" className="py-8">
      <Stack gap={8}>
        <div>
          <Text variant="h2">Admin Dashboard</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Platform overview and moderation.
          </Text>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Users />} label="Total Users" value={stats ? (stats.totalUsers || (stats.totalEmployees || 0) + (stats.totalEmployers || 0)) : '—'} />
            <StatCard icon={<Briefcase />} label="Active Jobs" value={stats?.activeJobs ?? '—'} />
            <StatCard icon={<Shield />} label="Pending Review" value={stats?.pendingJobs ?? '—'} />
            <StatCard icon={<CreditCard />} label="Monthly Revenue" value={revenueData?.mrr ? `₹${(revenueData.mrr / 100).toLocaleString('en-IN')}` : '—'} />
          </Grid>
        )}

        {/* Revenue Chart */}
        <Surface variant="elevated" padding="lg">
          <Text variant="h5" className="mb-6">Revenue (Last 12 Months)</Text>
          {revenueByMonth.length === 0 ? (
            <div className="text-center py-8">
              <Text variant="body-sm" color="muted">No revenue data yet. Revenue will appear here as subscriptions are purchased.</Text>
            </div>
          ) : (
            <RevenueChart data={revenueByMonth} />
          )}
        </Surface>

        {/* Quick Stats Table */}
        {revenueData?.revenueByPlan && revenueData.revenueByPlan.length > 0 && (
          <Surface variant="elevated" padding="lg">
            <Text variant="h5" className="mb-4">Revenue by Plan</Text>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Plan</th>
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Subscribers</th>
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.revenueByPlan.map((plan: any) => (
                    <tr key={plan.plan} className="border-b border-border last:border-0">
                      <td className="py-3"><Text variant="body-sm" className="font-medium capitalize">{plan.plan}</Text></td>
                      <td className="py-3 text-right"><Text variant="body-sm" color="secondary">{plan.count}</Text></td>
                      <td className="py-3 text-right"><Text variant="body-sm" className="font-medium">₹{(plan.revenue / 100).toLocaleString('en-IN')}</Text></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </Stack>
    </Container>
  );
}

function RevenueChart({ data }: { data: any[] }) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = data.find((m: any) => m.month === key);
    return {
      key,
      label: monthNames[d.getMonth()],
      revenue: existing?.revenue || 0,
    };
  });

  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1);

  return (
    <div className="flex items-end gap-1.5 h-[180px]">
      {months.map((month) => {
        const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
        return (
          <div key={month.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="relative group w-full flex justify-center flex-1 items-end">
              <div
                className="w-full max-w-7 rounded-t-md transition-colors cursor-default"
                style={{
                  height: `${Math.max(height, 3)}%`,
                  backgroundColor: month.revenue > 0 ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
                }}
              />
              {month.revenue > 0 && (
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  ₹{(month.revenue / 100).toLocaleString('en-IN')}
                </div>
              )}
            </div>
            <span className="text-[10px] text-foreground-muted">{month.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Surface variant="elevated" padding="md">
      <Stack gap={3}>
        <div className="flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-foreground-secondary [&>svg]:size-[18px]">
          {icon}
        </div>
        <div>
          <Text variant="h3" className="tabular-nums">
            {value}
          </Text>
          <Text variant="body-sm" color="secondary">
            {label}
          </Text>
        </div>
      </Stack>
    </Surface>
  );
}
