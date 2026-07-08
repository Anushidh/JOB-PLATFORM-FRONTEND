import { useState } from 'react';
import { Link } from 'react-router';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, EmptyState, Select,
} from '@/components/ui';
import { useEmployerJobs } from '@/hooks/useJobs';
import type { Job } from '@/types';
import { Plus, Briefcase, Eye, Users, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: 'Draft', variant: 'default' },
  pending: { label: 'Pending Review', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export function EmployerJobsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEmployerJobs({ page, limit: 10, status: statusFilter || undefined });

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2">My Jobs</Text>
            <Text variant="body" color="secondary" className="mt-1">
              Manage your job listings
            </Text>
          </div>
          <Link to="/employer/jobs/new">
            <Button leftIcon={<Plus />}>Post New Job</Button>
          </Link>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select
            selectSize="sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'pending', label: 'Pending' },
              { value: 'active', label: 'Active' },
              { value: 'closed', label: 'Closed' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          {data?.pagination && (
            <Text variant="caption" color="muted">
              {data.pagination.total} job{data.pagination.total !== 1 ? 's' : ''}
            </Text>
          )}
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="No jobs posted"
            description="Create your first job listing to start receiving applications."
            action={
              <Link to="/employer/jobs/new">
                <Button leftIcon={<Plus />}>Post a Job</Button>
              </Link>
            }
          />
        ) : (
          <Stack gap={3}>
            {data.data.map((job) => (
              <EmployerJobCard key={job._id} job={job} />
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={!data.pagination.hasPrev} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Text variant="body-sm" color="muted" className="px-3">
              {data.pagination.page} / {data.pagination.pages}
            </Text>
            <Button variant="outline" size="sm" disabled={!data.pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </Stack>
    </Container>
  );
}

/* ─── Job Card for Employer ─── */
function EmployerJobCard({ job }: { job: Job }) {
  const config = statusConfig[job.status] || statusConfig.draft;
  const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <Surface variant="elevated" padding="md">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50 shrink-0 mt-0.5">
          <Briefcase className="size-5 text-primary-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to={`/employer/jobs/${job._id}`} className="hover:underline truncate min-w-0">
              <Text variant="subtitle" className="truncate">{job.title}</Text>
            </Link>
            <Badge variant={config.variant} size="sm" dot className="shrink-0">{config.label}</Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-1">
            <Text variant="caption" color="muted" className="truncate">{job.location}</Text>
            <span className="text-foreground-muted hidden sm:inline">·</span>
            <Text variant="caption" color="muted" className="shrink-0">Posted {postedDate}</Text>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-5 shrink-0 pt-1">
          <StatPill icon={<Users />} value={job.applicationsCount} label="Applicants" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Link to={`/employer/jobs/${job._id}/applications`}>
            <Button variant="outline" size="xs">View Applicants</Button>
          </Link>
        </div>
      </div>
    </Surface>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1-5 text-foreground-muted" title={label}>
      <span className="[&>svg]:size-3.5">{icon}</span>
      <Text variant="body-sm" className="font-medium tabular-nums text-foreground">
        {value}
      </Text>
    </div>
  );
}
