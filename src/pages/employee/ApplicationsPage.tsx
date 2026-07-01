import { useState } from 'react';
import { Link } from 'react-router';
import {
  Container, Stack, Text, Badge, Surface, Spinner, EmptyState, Button,
  Select, Modal, ModalHeader, ModalBody, ModalFooter,
} from '@/components/ui';
import { useMyApplications, useWithdrawApplication } from '@/hooks/useApplications';
import type { Application, Job, Company } from '@/types';
import { FileText, Building2, Calendar, ChevronRight } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  applied: { label: 'Applied', variant: 'primary' },
  shortlisted: { label: 'Shortlisted', variant: 'success' },
  interview: { label: 'Interview', variant: 'success' },
  offer: { label: 'Offer', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
};

export function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [confirmWithdraw, setConfirmWithdraw] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useMyApplications({ page, limit: 10, status: statusFilter || undefined });

  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = () => {
    if (!confirmWithdraw) return;
    withdrawMutation.mutate(confirmWithdraw.id);
    setConfirmWithdraw(null);
  };

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2">My Applications</Text>
            <Text variant="body" color="secondary" className="mt-1">
              Track and manage your job applications
            </Text>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select
            selectSize="sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'applied', label: 'Applied' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'interview', label: 'Interview' },
              { value: 'offer', label: 'Offer' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'withdrawn', label: 'Withdrawn' },
            ]}
          />
          {data?.pagination && (
            <Text variant="caption" color="muted">
              {data.pagination.total} application{data.pagination.total !== 1 ? 's' : ''}
            </Text>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No applications yet"
            description="Start applying to jobs and track your progress here."
            action={
              <Link to="/employee/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            }
          />
        ) : (
          <Stack gap={3}>
            {data.data.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                onWithdraw={() => {
                  const job = application.job as Job;
                  setConfirmWithdraw({ id: application._id, title: job?.title || 'this job' });
                }}
                isWithdrawing={withdrawMutation.isPending}
              />
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Text variant="body-sm" color="muted">
              {data.pagination.page} / {data.pagination.pages}
            </Text>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Stack>

      {/* Withdraw Confirmation */}
      <Modal open={!!confirmWithdraw} onClose={() => setConfirmWithdraw(null)} size="sm">
        <ModalHeader onClose={() => setConfirmWithdraw(null)}>Withdraw Application</ModalHeader>
        <ModalBody>
          <Text variant="body" color="secondary">
            Are you sure you want to withdraw your application for <span className="font-medium text-foreground">{confirmWithdraw?.title}</span>? This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setConfirmWithdraw(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleWithdraw} loading={withdrawMutation.isPending}>Withdraw</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}

/* ─── Application Card ─── */
function ApplicationCard({
  application,
  onWithdraw,
  isWithdrawing,
}: {
  application: Application;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}) {
  const job = application.job as Job;
  const company = job?.company as Company;
  const config = statusConfig[application.status] || statusConfig.applied;
  const appliedDate = new Date(application.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const canWithdraw = !['withdrawn', 'rejected'].includes(application.status);

  return (
    <Surface variant="elevated" padding="md">
      <div className="flex items-center gap-4">
        {/* Company Logo */}
        {company?.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} className="size-11 rounded-lg object-cover border border-border shrink-0" />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 shrink-0">
            <Building2 className="size-5 text-foreground-muted" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Text variant="subtitle" className="truncate">
              {job?.title || 'Job'}
            </Text>
            <Badge variant={config.variant} size="sm">
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-0-5">
            <Text variant="body-sm" color="secondary">
              {company?.name || 'Company'}
            </Text>
            <span className="text-foreground-muted">·</span>
            <Text variant="caption" color="muted">
              <Calendar className="inline size-3 mr-1" />
              Applied {appliedDate}
            </Text>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canWithdraw && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onWithdraw}
              loading={isWithdrawing}
              className="text-danger-600"
            >
              Withdraw
            </Button>
          )}
          <Link to={`/employee/jobs/${typeof job === 'object' ? job._id : job}`}>
            <Button variant="ghost" size="icon-xs">
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Surface>
  );
}
