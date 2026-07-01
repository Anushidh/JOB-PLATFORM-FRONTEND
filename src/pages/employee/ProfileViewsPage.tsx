import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Surface, Spinner, EmptyState, Avatar, Badge,
} from '@/components/ui';
import { api } from '@/lib/api';
import { Eye, ChevronLeft, ChevronRight, Crown } from 'lucide-react';

export function ProfileViewsPage() {
  const [page, setPage] = useState(1);

  const { data: viewCount } = useQuery({
    queryKey: ['profile-view-count'],
    queryFn: async () => {
      const { data } = await api.get('/profile-views/count');
      return data.data;
    },
  });

  const { data: viewers, isLoading, error } = useQuery({
    queryKey: ['profile-viewers', page],
    queryFn: async () => {
      const { data } = await api.get('/profile-views/viewers', { params: { page, limit: 15 } });
      return data;
    },
  });

  const isPremiumGated = (error as any)?.response?.status === 403;

  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Profile Views</Text>
          <Text variant="body" color="secondary" className="mt-1">
            See who's been looking at your profile
          </Text>
        </div>

        {/* View Count */}
        {viewCount && (
          <Surface variant="elevated" padding="lg">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary-50">
                <Eye className="size-6 text-primary-600" />
              </div>
              <div>
                <Text variant="h3">{viewCount.viewCount}</Text>
                <Text variant="body-sm" color="secondary">Profile views in the last {viewCount.period}</Text>
              </div>
            </div>
          </Surface>
        )}

        {/* Viewers List */}
        {isPremiumGated ? (
          <Surface variant="outlined" padding="lg">
            <Stack align="center" gap={3} className="py-6">
              <Crown className="size-10 text-warning-500" />
              <Text variant="subtitle">Premium Feature</Text>
              <Text variant="body-sm" color="muted" className="text-center max-w-sm">
                Upgrade to a Premium plan to see who viewed your profile.
              </Text>
              <Button variant="primary" leftIcon={<Crown />}>Upgrade Plan</Button>
            </Stack>
          </Surface>
        ) : isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !viewers?.data || viewers.data.length === 0 ? (
          <EmptyState
            icon={<Eye />}
            title="No viewers yet"
            description="When someone views your profile, they'll appear here."
          />
        ) : (
          <Stack gap={2}>
            {viewers.data.map((view: any) => (
              <Surface key={view._id} variant="elevated" padding="sm">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar size="sm" fallback={view.viewerName || 'User'} />
                  <div className="flex-1 min-w-0">
                    <Text variant="body-sm" className="font-medium">{view.viewerName || 'Someone'}</Text>
                    <Text variant="caption" color="muted">{view.viewerRole}</Text>
                  </div>
                  <Text variant="caption" color="muted">
                    {new Date(view.viewedAt).toLocaleDateString()}
                  </Text>
                </div>
              </Surface>
            ))}
          </Stack>
        )}

        {viewers?.pagination && viewers.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={!viewers.pagination.hasPrev} onClick={() => setPage(p => p - 1)}><ChevronLeft className="size-4" /></Button>
            <Text variant="body-sm" color="muted" className="px-3">{viewers.pagination.page} / {viewers.pagination.pages}</Text>
            <Button variant="outline" size="sm" disabled={!viewers.pagination.hasNext} onClick={() => setPage(p => p + 1)}><ChevronRight className="size-4" /></Button>
          </div>
        )}
      </Stack>
    </Container>
  );
}
