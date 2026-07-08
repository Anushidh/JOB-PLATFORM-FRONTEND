import { Link } from 'react-router';
import {
  Container, Stack, Text, Button, Surface, Spinner, EmptyState, Badge,
} from '@/components/ui';
import { useFollowedCompanies, useUnfollowCompany } from '@/hooks/useCompanies';
import { Building2, Building, ExternalLink, MapPin, Search } from 'lucide-react';
import type { Company } from '@/types';

export function FollowingPage() {
  const { data: followedList, isLoading } = useFollowedCompanies();

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Companies You Follow</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Stay updated with the latest opportunities from your favorite employers.
          </Text>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !followedList || followedList.length === 0 ? (
          <EmptyState
            icon={<Building />}
            title="No companies followed yet"
            description="When you follow a company, they will appear here so you can easily track their open roles."
            action={
              <Link to="/employee/jobs">
                <Button variant="primary" leftIcon={<Search />}>Browse Jobs</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedList.map((item) => (
              <CompanyCard key={item._id} company={item.company} />
            ))}
          </div>
        )}
      </Stack>
    </Container>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const unfollowMutation = useUnfollowCompany();

  return (
    <Surface variant="elevated" padding="md" className="flex flex-col h-full group transition-shadow hover:shadow-md group-hover:border-primary-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/employee/companies/${company._id}`} className="shrink-0 hover:opacity-80 transition-opacity">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="size-12 rounded-lg object-cover border border-border" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-lg bg-neutral-100 border border-border">
                <Building2 className="size-6 text-foreground-muted" />
              </div>
            )}
          </Link>
          <div className="min-w-0">
            <Link to={`/employee/companies/${company._id}`}>
              <Text variant="subtitle" className="truncate hover:text-primary-600 transition-colors cursor-pointer">{company.name}</Text>
            </Link>
            {company.industry && (
              <Text variant="body-sm" color="secondary" className="truncate">{company.industry}</Text>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {company.location && (
          <Badge variant="default" size="sm">
            <MapPin className="size-3" /> {company.location}
          </Badge>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-danger-600 hover:text-danger-700 hover:bg-danger-50 border-danger-200 hover:border-danger-300"
          onClick={() => {
            const id = typeof company === 'string' ? company : company._id;
            if (id) unfollowMutation.mutate(id);
          }}
          loading={unfollowMutation.isPending}
        >
          Unfollow
        </Button>
        <Link to={`/employee/companies/${company._id}`} className="flex-1">
          <Button variant="secondary" size="sm" fullWidth rightIcon={<ExternalLink className="size-3" />}>
            View Profile
          </Button>
        </Link>
      </div>
    </Surface>
  );
}
