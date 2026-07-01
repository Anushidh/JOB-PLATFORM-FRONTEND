import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import {
  Container, Stack, Grid, Text, Input, Select, Button, Badge,
  Surface, Spinner, EmptyState, Divider,
} from '@/components/ui';
import { useJobs } from '@/hooks/useJobs';
import type { JobFilters } from '@/services/jobs.service';
import type { Job, Company } from '@/types';
import {
  Search, MapPin, Briefcase, Clock, Building2, ChevronLeft, ChevronRight,
  SlidersHorizontal, X,
} from 'lucide-react';

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const filters: JobFilters = {
    page: currentPage,
    limit: 12,
    search: searchParams.get('search') || undefined,
    location: searchParams.get('location') || undefined,
    jobType: searchParams.get('jobType') || undefined,
    workMode: searchParams.get('workMode') || undefined,
    experienceLevel: searchParams.get('experienceLevel') || undefined,
    skills: searchParams.get('skills') || undefined,
  };

  const { data, isLoading } = useJobs(filters);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const activeFilterCount = [
    filters.location, filters.jobType, filters.workMode, filters.experienceLevel, filters.skills,
  ].filter(Boolean).length;

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        {/* Header */}
        <div>
          <Text variant="h2">Find Jobs</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Discover opportunities that match your skills
          </Text>
        </div>

        {/* Search Bar */}
        <Surface variant="elevated" padding="md">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                placeholder="Job title, skills, or keywords..."
                leftIcon={<Search />}
                inputSize="lg"
                defaultValue={filters.search || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFilter('search', (e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            <div className="w-[200px] hidden md:block">
              <Input
                placeholder="Location"
                leftIcon={<MapPin />}
                inputSize="lg"
                defaultValue={filters.location || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFilter('location', (e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            <Button
              variant={activeFilterCount > 0 ? 'primary' : 'outline'}
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal />}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                  placeholder="Job Type"
                  selectSize="sm"
                  value={filters.jobType || ''}
                  onChange={(e) => updateFilter('jobType', e.target.value)}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'contract', label: 'Contract' },
                    { value: 'internship', label: 'Internship' },
                    { value: 'freelance', label: 'Freelance' },
                  ]}
                />
                <Select
                  placeholder="Work Mode"
                  selectSize="sm"
                  value={filters.workMode || ''}
                  onChange={(e) => updateFilter('workMode', e.target.value)}
                  options={[
                    { value: '', label: 'All Modes' },
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'onsite', label: 'Onsite' },
                  ]}
                />
                <Select
                  placeholder="Experience"
                  selectSize="sm"
                  value={filters.experienceLevel || ''}
                  onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                  options={[
                    { value: '', label: 'All Levels' },
                    { value: 'entry', label: 'Entry Level' },
                    { value: 'mid', label: 'Mid Level' },
                    { value: 'senior', label: 'Senior' },
                    { value: 'lead', label: 'Lead' },
                    { value: 'executive', label: 'Executive' },
                  ]}
                />
                <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X />}>
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </Surface>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="No jobs found"
            description="Try adjusting your search filters or check back later."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Text variant="body-sm" color="muted">
                {data.pagination.total} job{data.pagination.total !== 1 ? 's' : ''} found
              </Text>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.data.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasPrev}
                  onClick={() => goToPage(currentPage - 1)}
                  leftIcon={<ChevronLeft />}
                >
                  Previous
                </Button>
                <Text variant="body-sm" color="secondary" className="px-3">
                  Page {data.pagination.page} of {data.pagination.pages}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasNext}
                  onClick={() => goToPage(currentPage + 1)}
                  rightIcon={<ChevronRight />}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

/* ─── Job Card ─── */
function JobCard({ job }: { job: Job }) {
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
    <Link to={`/employee/jobs/${job._id}`} className="block group">
      <Surface
        variant="elevated"
        padding="md"
        className="h-full transition-shadow duration-normal hover:shadow-md group-hover:border-primary-200"
      >
        <Stack gap={4}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="size-10 rounded-lg object-cover border border-border" />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100">
                  <Building2 className="size-5 text-foreground-muted" />
                </div>
              )}
              <div className="min-w-0">
                <Text variant="subtitle" className="truncate group-hover:text-primary-600 transition-colors">
                  {job.title}
                </Text>
                <Text variant="body-sm" color="secondary">
                  {company?.name || 'Company'}
                </Text>
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
    </Link>
  );
}
