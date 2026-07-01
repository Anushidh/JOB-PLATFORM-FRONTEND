import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api';
import type { Conversation, Message, PaginationParams } from '@/types';

/* ─── Types ─── */

export interface SendMessageRequest {
  recipientId: string;
  recipientRole: 'employee' | 'employer';
  content: string;
}

/* ─── Service ─── */

export const messagesService = {
  sendMessage: (data: SendMessageRequest) =>
    api.post<ApiResponse<{ message: Message }>>('/messages', data),

  getConversations: (params: PaginationParams) =>
    api.get<PaginatedResponse<Conversation>>('/messages/conversations', { params }),

  getMessages: (conversationId: string, params: PaginationParams) =>
    api.get<PaginatedResponse<Message>>(`/messages/conversations/${conversationId}`, { params }),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/messages/unread-count'),

  deleteConversation: (conversationId: string) =>
    api.delete<ApiResponse<null>>(`/messages/conversations/${conversationId}`),
};
