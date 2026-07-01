import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, EmptyState,
  Select, Avatar, useToast,
} from '@/components/ui';
import { useJobApplications, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { useJob } from '@/hooks/useJobs';
import type { Application, Employee, Job } from '@/types';
import { ArrowLeft, Users, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  applied: { label: 'Applied', variant: 'primary' },
  shortlisted: { label: 'Shortlisted', variant: 'success' },
  interview: { label: 'Interview', variant: 'success' },
  offer: { label: 'Offer', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
};

export function EmployerApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: jobData } = useJob(jobId);
  const { data, isLoading } = useJobApplications(jobId!, { page, limit: 10, status: statusFilter || undefined });
  const updateStatusMutation = useUpdateApplicationStatus(jobId!);

  return (
    <Container size="xl" className="py-6">
      <Link to="/employer/jobs" className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <Stack gap={6}>
        <div>
          <Text variant="h2">Applicants</Text>
          {jobData && <Text variant="body" color="secondary" className="mt-1">For: <span className="font-medium text-foreground">{jobData.title}</span></Text>}
        </div>

        <div className="flex items-center gap-3">
          <Select selectSize="sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} options={[
            { value: '', label: 'All statuses' },
            { value: 'applied', label: 'Applied' },
            { value: 'shortlisted', label: 'Shortlisted' },
            { value: 'interview', label: 'Interview' },
            { value: 'offer', label: 'Offer' },
            { value: 'rejected', label: 'Rejected' },
          ]} />
          {data?.pagination && <Text variant="caption" color="muted">{data.pagination.total} applicant{data.pagination.total !== 1 ? 's' : ''}</Text>}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState icon={<Users />} title="No applicants yet" description="Applicants will appear here once people apply." />
        ) : (
          <Stack gap={3}>
            {data.data.map((application) => (
              <ApplicantCard
                key={application._id}
                application={application}
                onUpdateStatus={(status) => updateStatusMutation.mutate({ applicationId: application._id, status })}
              />
            ))}
          </Stack>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={!data.pagination.hasPrev} onClick={() => setPage(p => p - 1)}><ChevronLeft className="size-4" /></Button>
            <Text variant="body-sm" color="muted" className="px-3">{data.pagination.page} / {data.pagination.pages}</Text>
            <Button variant="outline" size="sm" disabled={!data.pagination.hasNext} onClick={() => setPage(p => p + 1)}><ChevronRight className="size-4" /></Button>
          </div>
        )}
      </Stack>
    </Container>
  );
}

function ApplicantCard({ application, onUpdateStatus }: { application: Application; onUpdateStatus: (status: string) => void }) {
  const applicant = application.applicant as Employee;
  const config = statusConfig[application.status] || statusConfig.applied;
  const appliedDate = new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Surface variant="elevated" padding="md">
      <div className="flex items-center gap-4">
        <Avatar size="md" src={applicant?.avatar} fallback={applicant ? `${applicant.firstName} ${applicant.lastName}` : '?'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Text variant="subtitle" className="truncate">{applicant?.firstName} {applicant?.lastName}</Text>
            <Badge variant={config.variant} size="sm">{config.label}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-0-5">
            {applicant?.headline && <Text variant="body-sm" color="secondary" className="truncate">{applicant.headline}</Text>}
            <Text variant="caption" color="muted" className="shrink-0">{appliedDate}</Text>
          </div>
          {applicant?.skills && applicant.skills.length > 0 && (
            <div className="flex gap-1 mt-2">
              {applicant.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-1-5 py-0-5 rounded-sm bg-neutral-50 text-[10px] text-foreground-secondary">{skill}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {application.status === 'applied' && (
            <>
              <Button variant="outline" size="xs" onClick={() => onUpdateStatus('shortlisted')} leftIcon={<CheckCircle />}>Shortlist</Button>
              <Button variant="ghost" size="xs" onClick={() => onUpdateStatus('rejected')} className="text-danger-600"><XCircle className="size-4" /></Button>
            </>
          )}
          {application.status === 'shortlisted' && (
            <Button variant="primary" size="xs" onClick={() => onUpdateStatus('interview')}>Schedule Interview</Button>
          )}
        </div>
      </div>
    </Surface>
  );
}
