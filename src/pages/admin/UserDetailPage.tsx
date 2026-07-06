import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Badge, Surface, Avatar, Spinner,
} from '@/components/ui';
import { api } from '@/lib/api';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard } from 'lucide-react';

export function UserDetailPage() {
  const { role, userId } = useParams<{ role: string; userId: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user-detail', role, userId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${role}/${userId}`);
      return data.data?.user;
    },
    enabled: !!role && !!userId,
  });

  const { data: subscription } = useQuery({
    queryKey: ['admin-user-subscription', userId],
    queryFn: async () => {
      // This is a workaround — in production, admin would have a dedicated endpoint
      const { data } = await api.get(`/admin/users/${role}/${userId}/subscription`);
      return data.data;
    },
    enabled: false, // Only enable if backend supports it
  });

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!user) {
    return (
      <Container size="lg" className="py-10">
        <Text variant="h3" color="secondary">User not found</Text>
      </Container>
    );
  }

  const isEmployee = role === 'employee';
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <Container size="lg" className="py-6">
      <Link
        to={isEmployee ? '/admin/employees' : '/admin/employers'}
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to {isEmployee ? 'job seekers' : 'employers'}
      </Link>

      <Stack gap={6}>
        {/* Header */}
        <Surface variant="elevated" padding="lg">
          <div className="flex items-start sm:items-center gap-5">
            <Avatar size="2xl" src={user.avatar} fallback={fullName} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Text variant="h3">{fullName}</Text>
                {user.isSuspended ? (
                  <Badge variant="danger" size="lg">Suspended</Badge>
                ) : user.isActive ? (
                  <Badge variant="success" size="lg" dot>Active</Badge>
                ) : (
                  <Badge variant="warning" size="lg">Inactive</Badge>
                )}
                <Badge variant="primary" className="capitalize">{role === 'employee' ? 'Job Seeker' : 'Employer'}</Badge>
              </div>
              {isEmployee && user.headline && (
                <Text variant="body" color="secondary" className="mt-1">{user.headline}</Text>
              )}
              {!isEmployee && user.position && (
                <Text variant="body" color="secondary" className="mt-1">{user.position}{user.department ? ` · ${user.department}` : ''}</Text>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-foreground-muted">
                <span className="flex items-center gap-1 break-all"><Mail className="size-3.5 shrink-0" /> {user.email}</span>
                {user.phone && <span className="flex items-center gap-1"><Phone className="size-3.5" /> {user.phone}</span>}
                {user.location && <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {user.location}</span>}
              </div>
            </div>
          </div>
        </Surface>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Info */}
          <Surface variant="elevated" padding="md">
            <Text variant="h5" className="mb-4">Account Info</Text>
            <Stack gap={3}>
              <InfoRow label="User ID" value={userId!} />
              <InfoRow label="Role" value={role === 'employee' ? 'Job Seeker' : 'Employer'} />
              <InfoRow label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
              <InfoRow label="Last Active" value={user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'} />
              <InfoRow label="Email Verified" value={user.isVerified === undefined ? '—' : user.isVerified ? 'Yes' : 'No'} />
            </Stack>
          </Surface>

          {/* Employee-specific */}
          {isEmployee && (
            <Surface variant="elevated" padding="md">
              <Text variant="h5" className="mb-4">Professional</Text>
              <Stack gap={3}>
                {user.skills && user.skills.length > 0 && (
                  <div>
                    <Text variant="caption" color="muted">Skills</Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.skills.map((skill: string) => (
                        <Badge key={skill} size="sm" variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <InfoRow label="Expected Salary" value={user.expectedSalary ? `₹${user.expectedSalary.toLocaleString('en-IN')}` : '—'} />
                <InfoRow label="Resume" value={user.resumePath ? 'Uploaded' : 'Not uploaded'} />
                {user.experience && user.experience.length > 0 && (
                  <InfoRow label="Experience" value={`${user.experience.length} position${user.experience.length > 1 ? 's' : ''}`} />
                )}
                {user.education && user.education.length > 0 && (
                  <InfoRow label="Education" value={`${user.education.length} degree${user.education.length > 1 ? 's' : ''}`} />
                )}
              </Stack>
            </Surface>
          )}

          {/* Employer-specific */}
          {!isEmployee && (
            <Surface variant="elevated" padding="md">
              <Text variant="h5" className="mb-4">Company</Text>
              <Stack gap={3}>
                <InfoRow label="Position" value={user.position || '—'} />
                <InfoRow label="Department" value={user.department || '—'} />
                <InfoRow label="Company" value={typeof user.company === 'object' ? user.company?.name : user.company || '—'} />
              </Stack>
            </Surface>
          )}
        </div>

        {/* Bio */}
        {isEmployee && user.bio && (
          <Surface variant="elevated" padding="md">
            <Text variant="h5" className="mb-3">Bio</Text>
            <Text variant="body-sm" color="secondary" className="whitespace-pre-wrap">{user.bio}</Text>
          </Surface>
        )}
      </Stack>
    </Container>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Text variant="body-sm" color="muted">{label}</Text>
      <Text variant="body-sm" className="font-medium text-right max-w-[60%] truncate">{value}</Text>
    </div>
  );
}
