import { Container, Text, Stack, Surface, Grid } from '@/components/ui';
import { Users, Briefcase, CreditCard, Shield } from 'lucide-react';

export function AdminDashboardPage() {
  return (
    <Container size="xl" className="py-8">
      <Stack gap={8}>
        <div>
          <Text variant="h2">Admin Dashboard</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Platform overview and moderation.
          </Text>
        </div>

        <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users />} label="Total Users" value="—" />
          <StatCard icon={<Briefcase />} label="Active Jobs" value="—" />
          <StatCard icon={<Shield />} label="Pending Review" value="—" />
          <StatCard icon={<CreditCard />} label="Monthly Revenue" value="—" />
        </Grid>

        <Surface variant="outlined" padding="lg">
          <Stack gap={2} align="center" className="py-8">
            <Text variant="subtitle" color="secondary">
              Admin panel coming soon
            </Text>
            <Text variant="body-sm" color="muted">
              User management, job moderation, and revenue tracking will appear here.
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
