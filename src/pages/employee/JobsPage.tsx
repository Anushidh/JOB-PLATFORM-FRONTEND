import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import {
  Container, Stack, Grid, Text, Input, Select, Button, Badge,
  Surface, Spinner, EmptyState, Divider, Checkbox,
} from '@/components/ui';
import { useJobs } from '@/hooks/useJobs';
import type { JobFilters } from '@/services/jobs.service';
import type { Job, Company } from '@/types';
import {
  Search, MapPin, Briefcase, Clock, Building2, ChevronLeft, ChevronRight,
  SlidersHorizontal, X,
} from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';

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
    following: searchParams.get('following') === 'true' || undefined,
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
    filters.location, filters.jobType, filters.workMode, filters.experienceLevel, filters.skills, filters.following,
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
              </div>
              <div className="flex items-center justify-between mt-4">
                <Checkbox
                  label="Only show jobs from companies I follow"
                  checked={!!filters.following}
                  onChange={(e) => updateFilter('following', e.target.checked ? 'true' : '')}
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


