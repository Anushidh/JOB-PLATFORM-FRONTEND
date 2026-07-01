import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, EmptyState, Select,
} from '@/components/ui';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/types';
import { FileText, Briefcase, Users, ChevronRight } from 'lucide-react';

export function AllApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employer-jobs-for-applications', statusFilter],
    queryFn: async () => {
      const { data } = await jobsService.getMyJobs({ page: 1, limit: 50, status: 'active' });
      return data;
    },
  });

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Applications</Text>
          <Text variant="body" color="secondary" className="mt-1">
            View applicants across all your job listings
          </Text>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No active jobs"
            description="Post a job to start receiving applications."
            action={<Link to="/employer/jobs/new"><Button>Post a Job</Button></Link>}
          />
        ) : (
          <Stack gap={3}>
            {data.data.map((job) => (
              <Surface key={job._id} variant="elevated" padding="md">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50 shrink-0">
                    <Briefcase className="size-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text variant="subtitle" className="truncate">{job.title}</Text>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Text variant="caption" color="muted">{job.location}</Text>
                      <span className="text-foreground-muted">·</span>
                      <div className="flex items-center gap-1 text-foreground-muted">
                        <Users className="size-3" />
                        <Text variant="caption" color="muted">{job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}</Text>
                      </div>
                    </div>
                  </div>
                  <Link to={`/employer/jobs/${job._id}/applications`}>
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight />}>
                      View
                    </Button>
                  </Link>
                </div>
              </Surface>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
