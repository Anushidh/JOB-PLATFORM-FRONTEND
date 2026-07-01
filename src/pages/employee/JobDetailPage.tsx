import { useParams, Link } from 'react-router';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, Divider, Avatar, useToast,
} from '@/components/ui';
import { useJob, useSimilarJobs } from '@/hooks/useJobs';
import { jobsService } from '@/services/jobs.service';
import { useCheckSaved, useSaveJob, useUnsaveJob } from '@/hooks/useSavedJobs';
import type { Job, Company } from '@/types';
import {
  ArrowLeft, MapPin, Briefcase, Clock, Building2, Globe, Users, Calendar,
  Bookmark, BookmarkCheck, ExternalLink, Share2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const { data: jobData, isLoading } = useJob(jobId);

  const { data: similarData } = useSimilarJobs(jobId);

  const { data: savedCheck } = useCheckSaved(jobId);

  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();

  useEffect(() => {
    if (savedCheck !== undefined) setIsSaved(savedCheck);
  }, [savedCheck]);

  // Track view
  useEffect(() => {
    if (jobId) {
      jobsService.trackView(jobId).catch(() => {});
    }
  }, [jobId]);

  const handleSave = async () => {
    if (!jobId) return;
    if (isSaved) {
      unsaveJobMutation.mutate(jobId);
      setIsSaved(false);
    } else {
      saveJobMutation.mutate(jobId);
      setIsSaved(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!jobData) {
    return (
      <Container size="lg" className="py-10">
        <Text variant="h3" color="secondary">Job not found</Text>
      </Container>
    );
  }

  const job = jobData as Job;
  const company = job.company as Company;

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.salaryCurrency || 'INR';
    const fmt = (n: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
    if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
    if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
    return `Up to ${fmt(job.salaryMax!)}`;
  };

  const salary = formatSalary();
  const workModeLabel = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' }[job.workMode] || job.workMode;
  const jobTypeLabel = {
    'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract',
    internship: 'Internship', freelance: 'Freelance',
  }[job.jobType] || job.jobType;
  const expLabel = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead', executive: 'Executive' }[job.experienceLevel] || job.experienceLevel;

  return (
    <Container size="lg" className="py-6">
      {/* Back */}
      <Link
        to="/employee/jobs"
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <Stack gap={6}>
          {/* Header */}
          <Surface variant="elevated" padding="lg">
            <Stack gap={5}>
              <div className="flex items-start gap-4">
                {company?.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="size-14 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-xl bg-neutral-100">
                    <Building2 className="size-7 text-foreground-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Text variant="h3">{job.title}</Text>
                  <Text variant="body" color="secondary" className="mt-0-5">
                    {company?.name || 'Company'}
                  </Text>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge><MapPin className="size-3" /> {job.location}</Badge>
                <Badge variant="primary">{jobTypeLabel}</Badge>
                <Badge variant="outline">{workModeLabel}</Badge>
                <Badge variant="outline">{expLabel}</Badge>
              </div>

              {salary && (
                <Text variant="subtitle" className="text-success-700">
                  {salary}
                  <span className="text-sm text-foreground-muted font-normal"> / year</span>
                </Text>
              )}

              <div className="flex gap-3">
                <Button size="lg" className="flex-1 sm:flex-none">
                  Apply Now
                </Button>
                <Button variant="outline" size="lg" onClick={handleSave}>
                  {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="size-4" />
                </Button>
              </div>
            </Stack>
          </Surface>

          {/* Description */}
          <Surface variant="elevated" padding="lg">
            <Text variant="h5" className="mb-4">About this role</Text>
            <div
              className="prose prose-sm max-w-none text-foreground-secondary [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:marker:text-foreground-muted"
              dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }}
            />
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
        </Stack>

        {/* Sidebar */}
        <Stack gap={4}>
          {/* Quick Info */}
          <Surface variant="elevated" padding="md">
            <Text variant="label" className="mb-3">Job Details</Text>
            <Stack gap={3}>
              <InfoRow icon={<Briefcase />} label="Type" value={jobTypeLabel} />
              <InfoRow icon={<MapPin />} label="Location" value={job.location} />
              <InfoRow icon={<Clock />} label="Work Mode" value={workModeLabel} />
              <InfoRow icon={<Users />} label="Experience" value={expLabel} />
              {job.applicationDeadline && (
                <InfoRow
                  icon={<Calendar />}
                  label="Deadline"
                  value={new Date(job.applicationDeadline).toLocaleDateString()}
                />
              )}
              <InfoRow
                icon={<Users />}
                label="Applicants"
                value={`${job.applicationsCount}`}
              />
            </Stack>
          </Surface>

          {/* Company */}
          {company && (
            <Surface variant="elevated" padding="md">
              <Text variant="label" className="mb-3">About the Company</Text>
              <Stack gap={3}>
                <div className="flex items-center gap-3">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="size-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100">
                      <Building2 className="size-5 text-foreground-muted" />
                    </div>
                  )}
                  <div>
                    <Text variant="body-sm" className="font-medium">{company.name}</Text>
                    {company.industry && <Text variant="caption" color="muted">{company.industry}</Text>}
                  </div>
                </div>
                {company.description && (
                  <Text variant="body-sm" color="secondary" className="line-clamp-3">
                    {company.description}
                  </Text>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                  >
                    <Globe className="size-3" /> Visit website
                  </a>
                )}
              </Stack>
            </Surface>
          )}

          {/* Similar Jobs */}
          {similarData && similarData.length > 0 && (
            <Surface variant="elevated" padding="md">
              <Text variant="label" className="mb-3">Similar Jobs</Text>
              <Stack gap={3}>
                {similarData.slice(0, 3).map((sj) => (
                  <Link
                    key={sj._id}
                    to={`/employee/jobs/${sj._id}`}
                    className="block p-2 rounded-md hover:bg-neutral-50 transition-colors -mx-2"
                  >
                    <Text variant="body-sm" className="font-medium">{sj.title}</Text>
                    <Text variant="caption" color="muted">{(sj.company as Company)?.name || 'Company'}</Text>
                  </Link>
                ))}
              </Stack>
            </Surface>
          )}
        </Stack>
      </div>
    </Container>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-foreground-muted">
        <span className="[&>svg]:size-4">{icon}</span>
        <Text variant="body-sm" color="muted">{label}</Text>
      </div>
      <Text variant="body-sm" className="font-medium">{value}</Text>
    </div>
  );
}
