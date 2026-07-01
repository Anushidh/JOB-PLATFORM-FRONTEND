import { useState } from 'react';
import {
  Container, Stack, Text, Button, Surface, Spinner, EmptyState, Badge, useToast,
} from '@/components/ui';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from '@/hooks/useNotifications';
import type { Notification } from '@/types';
import { Bell, CheckCheck, Trash2, Briefcase, FileText, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ReactNode> = {
  application_received: <FileText className="size-4" />,
  application_status_changed: <FileText className="size-4" />,
  job_approved: <Briefcase className="size-4" />,
  job_rejected: <Briefcase className="size-4" />,
  account_suspended: <Shield className="size-4" />,
  account_reactivated: <Shield className="size-4" />,
};

export function NotificationsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications({ page, limit: 15 });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const unreadCount = data?.data?.filter((n) => !n.isRead).length || 0;

  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2">Notifications</Text>
            <Text variant="body" color="secondary" className="mt-1">
              Stay updated on your activity
            </Text>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              loading={markAllReadMutation.isPending}
              leftIcon={<CheckCheck />}
            >
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState icon={<Bell />} title="No notifications" description="You're all caught up." />
        ) : (
          <Stack gap={2}>
            {data.data.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkRead={() => markReadMutation.mutate(notification._id)}
                onDelete={() => deleteMutation.mutate(notification._id)}
              />
            ))}
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

function NotificationItem({ notification, onMarkRead, onDelete }: { notification: Notification; onMarkRead: () => void; onDelete: () => void }) {
  const timeAgo = getTimeAgo(notification.createdAt);
  const icon = typeIcons[notification.type] || <Bell className="size-4" />;

  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl transition-colors', notification.isRead ? 'bg-background' : 'bg-primary-50/40 border border-primary-100')}>
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', notification.isRead ? 'bg-neutral-100 text-foreground-muted' : 'bg-primary-100 text-primary-700')}>{icon}</div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !notification.isRead && onMarkRead()}>
        <Text variant="body-sm" className={cn('font-medium', notification.isRead && 'font-normal')}>{notification.title}</Text>
        <Text variant="caption" color="secondary" className="mt-0-5 line-clamp-2">{notification.message}</Text>
        <Text variant="caption" color="muted" className="mt-1">{timeAgo}</Text>
      </div>
      <Button variant="ghost" size="icon-xs" onClick={onDelete} className="shrink-0 text-foreground-muted hover:text-danger-600"><Trash2 className="size-3.5" /></Button>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
