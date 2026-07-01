import { Container, Section, Text, Stack, Surface, Grid, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { Briefcase, FileText, Bookmark, Eye } from 'lucide-react';

export function EmployeeDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.firstName || 'there';

  return (
    <Container size="xl" className="py-8">
      <Stack gap={8}>
        {/* Welcome */}
        <div>
          <Text variant="h2">Good morning, {firstName}</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Here's what's happening with your job search.
          </Text>
        </div>

        {/* Quick Stats */}
        <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Briefcase />} label="Active Applications" value="—" />
          <StatCard icon={<FileText />} label="Interview Invites" value="—" />
          <StatCard icon={<Bookmark />} label="Saved Jobs" value="—" />
          <StatCard icon={<Eye />} label="Profile Views" value="—" subtext="Last 30 days" />
        </Grid>

        {/* Placeholder sections */}
        <Surface variant="outlined" padding="lg">
          <Stack gap={2} align="center" className="py-8">
            <Text variant="subtitle" color="secondary">
              Dashboard content coming soon
            </Text>
            <Text variant="body-sm" color="muted">
              Recommended jobs, recent activity, and profile completion will appear here.
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
