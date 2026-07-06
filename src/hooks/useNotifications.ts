import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useToast } from '@/components/ui';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: any) => [...notificationKeys.all, 'list', params] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

/* ─── Queries ─── */

export function useNotifications(params: PaginationParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const { data } = await notificationsService.getNotifications(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: async () => {
      const { data } = await notificationsService.getUnreadCount();
      return data.data!.count;
    },
    refetchInterval: 30000,
  });
}

/* ─── Mutations ─── */

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to mark as read', description: error.response?.data?.message });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.setQueryData(notificationKeys.unreadCount, 0);
      toast({ variant: 'success', title: 'All marked as read' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to delete', description: error.response?.data?.message });
    },
  });
}
