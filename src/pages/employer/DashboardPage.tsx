import { Container, Text, Stack, Surface, Grid } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { Briefcase, Users, Eye, TrendingUp } from 'lucide-react';

export function EmployerDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.firstName || 'there';

  return (
    <Container size="xl" className="py-8">
      <Stack gap={8}>
        {/* Welcome */}
        <div>
          <Text variant="h2">Welcome back, {firstName}</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Here's an overview of your hiring activity.
          </Text>
        </div>

        {/* Quick Stats */}
        <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Briefcase />} label="Active Jobs" value="—" />
          <StatCard icon={<Users />} label="Total Applicants" value="—" />
          <StatCard icon={<Eye />} label="Total Views" value="—" />
          <StatCard icon={<TrendingUp />} label="This Week" value="—" subtext="New applications" />
        </Grid>

        {/* Placeholder */}
        <Surface variant="outlined" padding="lg">
          <Stack gap={2} align="center" className="py-8">
            <Text variant="subtitle" color="secondary">
              Dashboard content coming soon
            </Text>
            <Text variant="body-sm" color="muted">
              Recent applications, job performance, and quick actions will appear here.
            </Text>
          </Stack>
        </Surface>
      </Stack>
    </Container>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <Surface variant="elevated" padding="md">
      <Stack gap={3}>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 [&>svg]:size-[18px]">
          {icon}
        </div>
        <div>
          <Text variant="h3" className="tabular-nums">
            {value}
          </Text>
          <Text variant="body-sm" color="secondary">
            {label}
          </Text>
          {subtext && (
            <Text variant="caption" color="muted" className="mt-0-5">
              {subtext}
            </Text>
          )}
        </div>
      </Stack>
    </Surface>
  );
}
