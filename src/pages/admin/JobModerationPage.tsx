import { useState } from 'react';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, EmptyState, useToast,
} from '@/components/ui';
import { usePendingJobs, useApproveJob, useRejectJob, useBulkApproveJobs, useBulkRejectJobs } from '@/hooks/useAdmin';
import type { Job, Company } from '@/types';
import { Shield, CheckCircle, XCircle, Building2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export function JobModerationPage() {
  const [page, setPage] = useState(1);
  const [actionJobId, setActionJobId] = useState<string | null>(null);

  const { data, isLoading } = usePendingJobs({ page, limit: 10 });
  const approveMutation = useApproveJob();
  const rejectMutation = useRejectJob();
  const bulkApproveMutation = useBulkApproveJobs();
  const bulkRejectMutation = useBulkRejectJobs();

  const handleBulkApprove = () => {
    if (!data?.data) return;
    const jobIds = data.data.map((job) => job._id);
    if (jobIds.length > 0) bulkApproveMutation.mutate(jobIds);
  };

  const handleBulkReject = () => {
    if (!data?.data) return;
    const jobIds = data.data.map((job) => job._id);
    if (jobIds.length > 0) bulkRejectMutation.mutate(jobIds);
  };

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Text variant="h2">Job Moderation</Text>
            <Text variant="body" color="secondary" className="mt-1">Review and approve pending job listings</Text>
          </div>
          {data?.data && data.data.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBulkApprove} loading={bulkApproveMutation.isPending} leftIcon={<CheckCircle className="size-4" />}>
                Approve All
              </Button>
              <Button variant="outline" className="text-danger-600 hover:bg-danger-50 hover:border-danger-200 hover:text-danger-700" onClick={handleBulkReject} loading={bulkRejectMutation.isPending} leftIcon={<XCircle className="size-4" />}>
                Reject All
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState icon={<Shield />} title="No pending jobs" description="All listings have been reviewed." />
        ) : (
          <Stack gap={4}>
            {data.data.map((job) => {
              const company = job.company as Company;
              return (
                <Surface key={job._id} variant="elevated" padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {company?.logoUrl ? (
                        <img src={company.logoUrl} alt="" className="size-11 rounded-lg object-cover border border-border shrink-0" />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-lg bg-neutral-100 shrink-0"><Building2 className="size-5 text-foreground-muted" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Text variant="subtitle">{job.title}</Text>
                        <div className="flex items-center gap-2 mt-0-5 flex-wrap">
                          <Text variant="body-sm" color="secondary">{company?.name}</Text>
                          <span className="text-foreground-muted hidden sm:inline">·</span>
                          <Text variant="caption" color="muted" className="shrink-0"><MapPin className="inline size-3" /> {job.location}</Text>
                        </div>
                        <Text variant="body-sm" color="muted" className="mt-2 line-clamp-2">{job.description.slice(0, 150)}...</Text>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.skillsRequired.slice(0, 5).map((s) => <Badge key={s} size="sm" variant="outline">{s}</Badge>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto border-t sm:border-0 border-border pt-3 sm:pt-0">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => { setActionJobId(job._id); approveMutation.mutate(job._id); }} loading={approveMutation.isPending && actionJobId === job._id} leftIcon={<CheckCircle />}>Approve</Button>
                      <Button variant="ghost" size="sm" className="flex-1 sm:flex-none text-danger-600" onClick={() => { setActionJobId(job._id); rejectMutation.mutate({ jobId: job._id }); }} loading={rejectMutation.isPending && actionJobId === job._id} leftIcon={<XCircle />}>Reject</Button>
                    </div>
                  </div>
                </Surface>
              );
            })}
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
