import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, useToast, Modal, ModalHeader, ModalBody, ModalFooter,
} from '@/components/ui';
import { useJob, useChangeJobStatus, useDeleteJob } from '@/hooks/useJobs';
import type { Job, Company } from '@/types';
import {
  ArrowLeft, MapPin, Briefcase, Users, Calendar, Edit, Trash2, Eye, Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { jobsService } from '@/services/jobs.service';

const statusConfig: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: 'Draft', variant: 'default' },
  pending: { label: 'Pending Review', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export function EmployerJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: job, isLoading } = useJob(jobId);
  const changeStatusMutation = useChangeJobStatus(jobId!);
  const deleteMutation = useDeleteJob();

  const { data: stats } = useQuery({
    queryKey: ['job-stats', jobId],
    queryFn: async () => {
      const { data } = await jobsService.getJobQuickStats(jobId!);
      return data.data;
    },
    enabled: !!jobId,
  });

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!job) {
    return (
      <Container size="lg" className="py-10">
        <Text variant="h3" color="secondary">Job not found</Text>
      </Container>
    );
  }

  const company = job.company as Company;
  const config = statusConfig[job.status] || statusConfig.draft;

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: job.salaryCurrency || 'INR', maximumFractionDigits: 0 }).format(n);
    if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
    if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
    return `Up to ${fmt(job.salaryMax!)}`;
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(jobId!, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate('/employer/jobs');
      },
    });
  };

  return (
    <Container size="lg" className="py-6">
      <Link
        to="/employer/jobs"
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <Stack gap={6}>
        {/* Header */}
        <Surface variant="elevated" padding="lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Text variant="h3">{job.title}</Text>
                <Badge variant={config.variant} size="lg" dot>{config.label}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-foreground-muted">
                <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="size-3.5" /> {job.jobType}</span>
                <span className="flex items-center gap-1"><Clock className="size-3.5" /> {job.workMode}</span>
              </div>
              {formatSalary() && (
                <Text variant="body" className="text-success-700 font-medium mt-2">{formatSalary()}</Text>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/employer/jobs/${jobId}/applications`}>
                <Button variant="outline" size="sm" leftIcon={<Users />}>
                  Applicants ({job.applicationsCount})
                </Button>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={handleDelete} className="text-foreground-muted hover:text-danger-600">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </Surface>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Surface variant="elevated" padding="md">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50">
                  <Eye className="size-4 text-primary-600" />
                </div>
                <div>
                  <Text variant="h4" className="tabular-nums">{stats.views ?? 0}</Text>
                  <Text variant="caption" color="muted">Views</Text>
                </div>
              </div>
            </Surface>
            <Surface variant="elevated" padding="md">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50">
                  <Users className="size-4 text-primary-600" />
                </div>
                <div>
                  <Text variant="h4" className="tabular-nums">{stats.applications ?? 0}</Text>
                  <Text variant="caption" color="muted">Applications</Text>
                </div>
              </div>
            </Surface>
            <Surface variant="elevated" padding="md">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50">
                  <Briefcase className="size-4 text-primary-600" />
                </div>
                <div>
                  <Text variant="h4" className="tabular-nums">{stats.clicks ?? 0}</Text>
                  <Text variant="caption" color="muted">Clicks</Text>
                </div>
              </div>
            </Surface>
          </div>
        )}

        {/* Status Actions */}
        {(job.status === 'active' || job.status === 'draft') && (
          <Surface variant="flat" padding="md">
            <div className="flex items-center justify-between">
              <Text variant="body-sm" color="secondary">
                {job.status === 'active' ? 'This job is live and accepting applications.' : 'This job is in draft mode.'}
              </Text>
              <div className="flex gap-2">
                {job.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={() => changeStatusMutation.mutate('closed')}>
                    Close Job
                  </Button>
                )}
                {job.status === 'draft' && (
                  <Button size="sm" onClick={() => changeStatusMutation.mutate('active')}>
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </Surface>
        )}

        {/* Description */}
        <Surface variant="elevated" padding="lg">
          <Text variant="h5" className="mb-4">Job Description</Text>
          <div className="text-sm text-foreground-secondary whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </Surface>

        {/* Skills */}
        {job.skillsRequired.length > 0 && (
          <Surface variant="elevated" padding="lg">
            <Text variant="h5" className="mb-4">Required Skills</Text>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill) => (
                <Badge key={skill} variant="primary" size="lg">{skill}</Badge>
              ))}
            </div>
          </Surface>
        )}

        {/* Meta */}
        <Surface variant="elevated" padding="md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <Text variant="caption" color="muted">Posted</Text>
              <Text variant="body-sm" className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</Text>
            </div>
            <div>
              <Text variant="caption" color="muted">Experience</Text>
              <Text variant="body-sm" className="font-medium capitalize">{job.experienceLevel}</Text>
            </div>
            {job.applicationDeadline && (
              <div>
                <Text variant="caption" color="muted">Deadline</Text>
                <Text variant="body-sm" className="font-medium">{new Date(job.applicationDeadline).toLocaleDateString()}</Text>
              </div>
            )}
            <div>
              <Text variant="caption" color="muted">Company</Text>
              <Text variant="body-sm" className="font-medium">{company?.name || '—'}</Text>
            </div>
          </div>
        </Surface>
      </Stack>

      <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="md">
        <ModalHeader onClose={() => setIsDeleteModalOpen(false)}>Delete Job</ModalHeader>
        <ModalBody>
          <Text variant="body" color="secondary">
            Are you sure you want to delete this job? This action cannot be undone and all associated applications will be permanently closed.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" loading={deleteMutation.isPending} onClick={confirmDelete}>Delete Job</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}
