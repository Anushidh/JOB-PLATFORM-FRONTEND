import { Link } from 'react-router';
import { Stack, Text, Badge, Surface } from '@/components/ui';
import { Building2, MapPin } from 'lucide-react';
import type { Job, Company } from '@/types';

export function JobCard({ job }: { job: Job }) {
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
  const postedDate = new Date(job.createdAt);
  const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  const workModeLabel = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' }[job.workMode] || job.workMode;
  const jobTypeLabel = {
    'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract',
    internship: 'Internship', freelance: 'Freelance',
  }[job.jobType] || job.jobType;

  return (
    <Surface
      variant="elevated"
      padding="md"
      className="h-full transition-shadow duration-normal hover:shadow-md group-hover:border-primary-200"
    >
      <Stack gap={4}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Make the logo clickable to company details */}
            <Link to={`/employee/companies/${company?._id}`} className="shrink-0 hover:opacity-80 transition-opacity">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="size-10 rounded-lg object-cover border border-border" />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100">
                  <Building2 className="size-5 text-foreground-muted" />
                </div>
              )}
            </Link>
            <div className="min-w-0">
              {/* Make the job title clickable to job details */}
              <Link to={`/employee/jobs/${job._id}`}>
                <Text variant="subtitle" className="truncate hover:text-primary-600 transition-colors cursor-pointer">
                  {job.title}
                </Text>
              </Link>
              {/* Make the company name clickable to company details */}
              <Link to={`/employee/companies/${company?._id}`}>
                <Text variant="body-sm" color="secondary" className="hover:text-primary-600 transition-colors cursor-pointer">
                  {company?.name || 'Company'}
                </Text>
              </Link>
            </div>
          </div>
          <Text variant="caption" color="muted" className="shrink-0">
            {timeAgo}
          </Text>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" size="sm">
            <MapPin className="size-3" /> {job.location}
          </Badge>
          <Badge variant="primary" size="sm">{jobTypeLabel}</Badge>
          <Badge variant="outline" size="sm">{workModeLabel}</Badge>
        </div>

        {/* Skills */}
        {job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skillsRequired.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0-5 rounded-md bg-neutral-50 text-xs text-foreground-secondary"
              >
                {skill}
              </span>
            ))}
            {job.skillsRequired.length > 4 && (
              <span className="px-2 py-0-5 text-xs text-foreground-muted">
                +{job.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        {salary && (
          <Text variant="body-sm" className="font-medium text-success-700">
            {salary}
          </Text>
        )}
      </Stack>
    </Surface>
  );
}
