import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { Notification, PaginationParams } from '@/types';

/* ─── Service ─── */

export const notificationsService = {
  getNotifications: (params: PaginationParams & { unread?: string }) =>
    api.get<PaginatedResponse<Notification>>('/notifications', { params }),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (notificationId: string) =>
    api.patch<ApiResponse<{ notification: Notification }>>(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    api.patch<ApiResponse<null>>('/notifications/read-all'),

  deleteNotification: (notificationId: string) =>
    api.delete<ApiResponse<null>>(`/notifications/${notificationId}`),
};
