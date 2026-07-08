import { useParams, Link } from 'react-router';
import { Container, Stack, Text, Surface, Spinner, Button, Badge } from '@/components/ui';
import { useCompany, useCheckFollowing, useFollowCompany, useUnfollowCompany } from '@/hooks/useCompanies';
import { useJobs } from '@/hooks/useJobs';
import { Building2, Globe, MapPin, Users, Briefcase, ExternalLink, CalendarDays } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';

export function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  
  const { data: company, isLoading: isLoadingCompany } = useCompany(companyId!);
  const { data: isFollowing, isLoading: isLoadingFollowing } = useCheckFollowing(companyId!);
  const followMutation = useFollowCompany();
  const unfollowMutation = useUnfollowCompany();

  const { data: jobsData, isLoading: isLoadingJobs } = useJobs({
    page: 1,
    limit: 10,
    company: companyId,
  });

  if (isLoadingCompany) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!company) {
    return (
      <Container size="md" className="py-20 text-center">
        <Text variant="h2">Company Not Found</Text>
        <Text variant="body" color="secondary" className="mt-2">The company you are looking for does not exist.</Text>
        <Link to="/employee/jobs" className="mt-6 inline-block">
          <Button variant="primary">Back to Jobs</Button>
        </Link>
      </Container>
    );
  }

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate(company._id);
    } else {
      followMutation.mutate(company._id);
    }
  };

  return (
    <div className="pb-12 bg-neutral-50 min-h-screen">
      {/* Hero Banner Section */}
      <div className="w-full bg-white border-b border-border mb-6">
        {/* Banner Image */}
        <div className="h-48 md:h-64 lg:h-80 w-full bg-neutral-200 relative">
          {company.bannerUrl ? (
            <img src={company.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-linear-to-r from-primary-900 to-primary-700" />
          )}
        </div>

        <Container size="lg">
          <div className="px-4 pb-6 pt-4 flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20 relative z-10">
            {/* Logo */}
            <div className="relative size-32 rounded-xl bg-white p-1.5 shadow-md border border-border">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="size-full rounded-lg object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center rounded-lg bg-neutral-100">
                  <Building2 className="size-12 text-foreground-muted" />
                </div>
              )}
            </div>
            
            {/* Header Info */}
            <div className="flex-1 pb-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Text variant="h2">{company.name}</Text>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-foreground-muted">
                    {company.industry && (
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Briefcase className="size-4" /> {company.industry}
                      </span>
                    )}
                    {company.location && (
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="size-4" /> {company.location}
                      </span>
                    )}
                    {company.size && (
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Users className="size-4" /> {company.size}
                      </span>
                    )}
                  </div>
                </div>

                <Button 
                  variant={isFollowing ? 'outline' : 'primary'}
                  onClick={handleFollowToggle}
                  loading={isLoadingFollowing || followMutation.isPending || unfollowMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {isFollowing ? 'Following' : 'Follow Company'}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Stack gap={6}>
              <div>
                <Text variant="h4" className="mb-4">About {company.name}</Text>
                {company.description ? (
                  <Text variant="body" className="whitespace-pre-wrap leading-relaxed text-foreground-muted">
                    {company.description}
                  </Text>
                ) : (
                  <Text variant="body" color="secondary" className="italic">No description provided.</Text>
                )}
              </div>

              <div>
                <Text variant="h4" className="mb-4">Active Jobs</Text>
                {isLoadingJobs ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : !jobsData?.data.length ? (
                  <Surface variant="flat" padding="lg" className="text-center">
                    <Text variant="body" color="secondary">No active jobs posted by this company.</Text>
                  </Surface>
                ) : (
                  <Stack gap={4}>
                    {jobsData.data.map((job) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </Stack>
                )}
              </div>
            </Stack>
          </div>

          {/* Sidebar Area */}
          <div className="order-1 lg:order-2">
            <Surface variant="flat" padding="lg">
              <Text variant="h5" className="mb-4">Company Overview</Text>
              <Stack gap={4}>
                {company.website && (
                  <div>
                    <Text variant="body-sm" color="secondary" className="mb-1 uppercase font-semibold tracking-wider">Website</Text>
                    <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                      <Globe className="size-4" /> {company.website.replace(/^https?:\/\//, '')} <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
                {company.foundedYear && (
                  <div>
                    <Text variant="body-sm" color="secondary" className="mb-1 uppercase font-semibold tracking-wider">Founded</Text>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-foreground-muted" /> 
                      <Text variant="body">{company.foundedYear}</Text>
                    </div>
                  </div>
                )}
                {company.industry && (
                  <div>
                    <Text variant="body-sm" color="secondary" className="mb-1 uppercase font-semibold tracking-wider">Industry</Text>
                    <Text variant="body">{company.industry}</Text>
                  </div>
                )}
                {company.size && (
                  <div>
                    <Text variant="body-sm" color="secondary" className="mb-1 uppercase font-semibold tracking-wider">Company Size</Text>
                    <Text variant="body">{company.size}</Text>
                  </div>
                )}
              </Stack>
            </Surface>
          </div>
        </div>
      </Container>
    </div>
  );
}
