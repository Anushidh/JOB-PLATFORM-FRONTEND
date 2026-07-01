import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesService } from '@/services/messages.service';
import { useToast } from '@/components/ui';
import type { SendMessageRequest } from '@/services/messages.service';
import type { PaginationParams } from '@/types';

/* ─── Query Keys ─── */

export const messageKeys = {
  all: ['messages'] as const,
  conversations: (params: any) => [...messageKeys.all, 'conversations', params] as const,
  messages: (conversationId: string, params: any) => [...messageKeys.all, 'thread', conversationId, params] as const,
  unreadCount: ['messages', 'unread-count'] as const,
};

/* ─── Queries ─── */

export function useConversations(params: PaginationParams) {
  return useQuery({
    queryKey: messageKeys.conversations(params),
    queryFn: async () => {
      const { data } = await messagesService.getConversations(params);
      return data.data;
    },
  });
}

export function useMessages(conversationId: string | null, params: PaginationParams) {
  return useQuery({
    queryKey: messageKeys.messages(conversationId!, params),
    queryFn: async () => {
      const { data } = await messagesService.getMessages(conversationId!, params);
      return data.data;
    },
    enabled: !!conversationId,
    refetchInterval: 10000,
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: messageKeys.unreadCount,
    queryFn: async () => {
      const { data } = await messagesService.getUnreadCount();
      return data.data!.count;
    },
    refetchInterval: 30000,
  });
}

/* ─── Mutations ─── */

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messagesService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to send', description: error.response?.data?.message });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (conversationId: string) => messagesService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
      toast({ variant: 'info', title: 'Conversation deleted' });
    },
  });
}
