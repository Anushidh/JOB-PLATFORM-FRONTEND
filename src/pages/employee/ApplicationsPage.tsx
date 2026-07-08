import { useState } from 'react';
import { Link } from 'react-router';
import {
  Container, Stack, Text, Badge, Surface, Spinner, EmptyState, Button,
  Select, Modal, ModalHeader, ModalBody, ModalFooter,
} from '@/components/ui';
import { useMyApplications, useWithdrawApplication } from '@/hooks/useApplications';
import type { Application, Job, Company } from '@/types';
import { FileText, Building2, Calendar, ChevronRight, MapPin, Video, Phone, Clock } from 'lucide-react';

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

  // Extract interview details from statusHistory
  const interviewEntry = application.statusHistory?.find(h => h.status === 'interview' && h.note);
  const interviewDetails = interviewEntry?.note ? parseInterviewNote(interviewEntry.note) : null;

  return (
    <Surface variant="elevated" padding="md">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Company Logo */}
        {company?.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} className="size-11 rounded-lg object-cover border border-border shrink-0 mt-0.5" />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 shrink-0 mt-0.5">
            <Building2 className="size-5 text-foreground-muted" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Text variant="subtitle" className="truncate">
              {job?.title || 'Job'}
            </Text>
            <Badge variant={config.variant} size="sm" className="shrink-0">
              {config.label}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-1">
            <Text variant="body-sm" color="secondary" className="truncate">
              {company?.name || 'Company'}
            </Text>
            <span className="text-foreground-muted hidden sm:inline">·</span>
            <Text variant="caption" color="muted" className="shrink-0">
              <Calendar className="inline size-3 mr-1" />
              Applied {appliedDate}
            </Text>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-1">
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

      {/* Interview Details */}
      {interviewDetails && application.status === 'interview' && (
        <div className="mt-3 ml-15 rounded-lg border border-primary-200 bg-primary-50/50 p-3">
          <Text variant="label" className="mb-2 text-primary-700">Interview Scheduled</Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {interviewDetails.date && (
              <div className="flex items-center gap-2 text-foreground-secondary">
                <Calendar className="size-3.5 text-primary-600" />
                <span>{new Date(interviewDetails.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
            {interviewDetails.time && (
              <div className="flex items-center gap-2 text-foreground-secondary">
                <Clock className="size-3.5 text-primary-600" />
                <span>{formatTime12h(interviewDetails.time)}</span>
              </div>
            )}
            {interviewDetails.type && (
              <div className="flex items-center gap-2 text-foreground-secondary">
                {interviewDetails.type.toLowerCase().includes('video') ? <Video className="size-3.5 text-primary-600" /> :
                 interviewDetails.type.toLowerCase().includes('phone') ? <Phone className="size-3.5 text-primary-600" /> :
                 <MapPin className="size-3.5 text-primary-600" />}
                <span>{interviewDetails.type}</span>
              </div>
            )}
            {interviewDetails.meetingLink && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Video className="size-3.5 text-primary-600 shrink-0" />
                <a href={interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate">
                  {interviewDetails.meetingLink}
                </a>
              </div>
            )}
            {interviewDetails.location && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="size-3.5 text-primary-600 shrink-0" />
                <span>{interviewDetails.location}</span>
              </div>
            )}
          </div>
          {interviewDetails.notes && (
            <div className="mt-2 pt-2 border-t border-primary-200">
              <Text variant="body-sm" color="secondary">{interviewDetails.notes}</Text>
            </div>
          )}
        </div>
      )}
    </Surface>
  );
}

/* ─── Format Time to 12h ─── */
function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/* ─── Parse Interview Note ─── */
function parseInterviewNote(note: string): { date?: string; time?: string; type?: string; meetingLink?: string; location?: string; notes?: string } | null {
  if (!note.startsWith('Interview scheduled')) return null;

  const lines = note.split('\n').map(l => l.replace(/^[•\s]+/, '').trim());
  
  let date: string | undefined;
  let time: string | undefined;
  let type: string | undefined;
  let meetingLink: string | undefined;
  let location: string | undefined;
  let notes: string | undefined;

  for (const line of lines) {
    if (line.startsWith('Date:')) {
      const parts = line.replace('Date:', '').trim().split(' at ');
      date = parts[0]?.trim();
      if (parts[1]) time = parts[1].trim();
    } else if (line.startsWith('Type:')) {
      type = line.replace('Type:', '').trim();
    } else if (line.startsWith('Meeting Link:')) {
      meetingLink = line.replace('Meeting Link:', '').trim();
    } else if (line.startsWith('Location:')) {
      location = line.replace('Location:', '').trim();
    } else if (line.startsWith('Notes:')) {
      notes = line.replace('Notes:', '').trim();
    }
  }

  return { date, time, type, meetingLink, location, notes };
}
