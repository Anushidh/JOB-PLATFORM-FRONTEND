import { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, EmptyState,
  Select, Avatar, Input, Textarea, useToast,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from '@/components/ui';
import { useJobApplications, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { useJob } from '@/hooks/useJobs';
import { NewMessageModal } from '@/components/NewMessageModal';
import type { Application, Employee, Job } from '@/types';
import { ArrowLeft, Users, CheckCircle, XCircle, ChevronLeft, ChevronRight, MessageSquare, Zap, Video, Calendar } from 'lucide-react';

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
  const [messageTarget, setMessageTarget] = useState<{ id: string; role: 'employee'; name: string } | null>(null);
  const [interviewTarget, setInterviewTarget] = useState<{ applicationId: string; name: string } | null>(null);

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
                onMessage={(applicant) => setMessageTarget({ id: applicant._id, role: 'employee', name: `${applicant.firstName} ${applicant.lastName}` })}
                onScheduleInterview={(applicant) => setInterviewTarget({ applicationId: application._id, name: `${applicant.firstName} ${applicant.lastName}` })}
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
      <NewMessageModal
        open={!!messageTarget}
        onClose={() => setMessageTarget(null)}
        recipientId={messageTarget?.id}
        recipientRole={messageTarget?.role}
        recipientName={messageTarget?.name}
      />
      <ScheduleInterviewModal
        open={!!interviewTarget}
        onClose={() => setInterviewTarget(null)}
        candidateName={interviewTarget?.name || ''}
        onSchedule={(details) => {
          if (interviewTarget) {
            const note = `Interview scheduled:\n• Date: ${details.date} at ${details.time}\n• Type: ${details.type}\n• ${details.type === 'in-person' ? `Location: ${details.location}` : `Meeting Link: ${details.meetingLink}`}${details.notes ? `\n• Notes: ${details.notes}` : ''}`;
            updateStatusMutation.mutate(
              { applicationId: interviewTarget.applicationId, status: 'interview', note },
              { onSuccess: () => setInterviewTarget(null) },
            );
          }
        }}
        isLoading={updateStatusMutation.isPending}
      />
    </Container>
  );
}

function ApplicantCard({ application, onUpdateStatus, onMessage, onScheduleInterview }: { application: Application & { isPriority?: boolean }; onUpdateStatus: (status: string) => void; onMessage: (applicant: Employee) => void; onScheduleInterview: (applicant: Employee) => void }) {
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
            {(application as any).isPriority && (
              <Badge variant="warning" size="sm"><Zap className="size-3 mr-0.5" />Priority</Badge>
            )}
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
          <Button variant="ghost" size="icon-xs" onClick={() => applicant && onMessage(applicant)} aria-label="Message">
            <MessageSquare className="size-4" />
          </Button>
          {application.status === 'applied' && (
            <>
              <Button variant="outline" size="xs" onClick={() => onUpdateStatus('shortlisted')} leftIcon={<CheckCircle />}>Shortlist</Button>
              <Button variant="ghost" size="xs" onClick={() => onUpdateStatus('rejected')} className="text-danger-600"><XCircle className="size-4" /></Button>
            </>
          )}
          {application.status === 'shortlisted' && (
            <Button variant="primary" size="xs" onClick={() => applicant && onScheduleInterview(applicant)}>Schedule Interview</Button>
          )}
          {application.status === 'interview' && (
            <>
              <Button variant="primary" size="xs" onClick={() => onUpdateStatus('offer')} leftIcon={<CheckCircle />}>Send Offer</Button>
              <Button variant="ghost" size="xs" onClick={() => onUpdateStatus('rejected')} className="text-danger-600"><XCircle className="size-4" /></Button>
            </>
          )}
        </div>
      </div>
    </Surface>
  );
}


/* ─── Schedule Interview Modal ─── */

interface InterviewDetails {
  date: string;
  time: string;
  type: 'video' | 'in-person' | 'phone';
  meetingLink: string;
  location: string;
  notes: string;
}

function ScheduleInterviewModal({
  open,
  onClose,
  candidateName,
  onSchedule,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSchedule: (details: InterviewDetails) => void;
  isLoading: boolean;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'video' | 'in-person' | 'phone'>('video');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const generateJitsiLink = () => {
    const roomId = `hireflow-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setMeetingLink(`https://meet.jit.si/${roomId}`);
  };

  const handleSubmit = () => {
    if (!date || !time) {
      toast({ variant: 'error', title: 'Please select date and time' });
      return;
    }
    if (type === 'video' && !meetingLink) {
      toast({ variant: 'error', title: 'Please provide a meeting link or generate one' });
      return;
    }
    if (type === 'in-person' && !location) {
      toast({ variant: 'error', title: 'Please provide the interview location' });
      return;
    }
    onSchedule({ date, time, type, meetingLink, location, notes });
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        Schedule Interview with {candidateName}
      </ModalHeader>
      <ModalBody>
        <Stack gap={4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <Select
            label="Interview Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { value: 'video', label: 'Video Call' },
              { value: 'in-person', label: 'In-Person' },
              { value: 'phone', label: 'Phone Call' },
            ]}
          />

          {type === 'video' && (
            <div>
              <Input
                label="Meeting Link"
                placeholder="https://meet.google.com/... or paste any link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                leftIcon={<Video />}
                onClick={generateJitsiLink}
              >
                Generate Free Meeting Link (Jitsi)
              </Button>
            </div>
          )}

          {type === 'in-person' && (
            <Input
              label="Location"
              placeholder="e.g. Office at 123 Main St, Floor 4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          )}

          <Textarea
            label="Notes for the candidate (optional)"
            placeholder="e.g. Please bring your portfolio, the interview will be 45 minutes..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          loading={isLoading}
          leftIcon={<Calendar />}
        >
          Schedule Interview
        </Button>
      </ModalFooter>
    </Modal>
  );
}
