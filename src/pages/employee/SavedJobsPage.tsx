import { useState } from 'react';
import { Link } from 'react-router';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, EmptyState, useToast,
} from '@/components/ui';
import { useSavedJobs, useUnsaveJob } from '@/hooks/useSavedJobs';
import type { Job, Company } from '@/types';
import { Bookmark, Building2, MapPin, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading } = useSavedJobs({ page, limit: 10 });

  const unsaveMutation = useUnsaveJob();

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Saved Jobs</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Jobs you've bookmarked for later
          </Text>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState
            icon={<Bookmark />}
            title="No saved jobs"
            description="Save jobs while browsing to review them later."
            action={<Link to="/employee/jobs"><Button>Browse Jobs</Button></Link>}
          />
        ) : (
          <Stack gap={3}>
            {data.data.map((item: any) => {
              const job = item.job as Job;
              const company = job?.company as Company;
              if (!job) return null;
              return (
                <Surface key={item._id} variant="elevated" padding="md">
                  <div className="flex items-center gap-4">
                    {company?.logoUrl ? (
                      <img src={company.logoUrl} alt="" className="size-10 rounded-lg object-cover border border-border shrink-0" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100 shrink-0">
                        <Building2 className="size-5 text-foreground-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/employee/jobs/${job._id}`} className="hover:underline">
                        <Text variant="subtitle" className="truncate">{job.title}</Text>
                      </Link>
                      <div className="flex items-center gap-2 mt-0-5">
                        <Text variant="body-sm" color="secondary">{company?.name}</Text>
                        <span className="text-foreground-muted">·</span>
                        <Text variant="caption" color="muted"><MapPin className="inline size-3" /> {job.location}</Text>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => unsaveMutation.mutate(job._id)}
                      className="text-foreground-muted hover:text-danger-600"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
