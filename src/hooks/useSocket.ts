import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { messageKeys } from './useMessages';
import { notificationKeys } from './useNotifications';

/**
 * Connects to Socket.IO when user is authenticated.
 * Listens for real-time events and invalidates relevant queries.
 */
export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    try {
      const socket = connectSocket();

      // New message received → refresh conversations and messages
      socket.on('message:new', () => {
        queryClient.invalidateQueries({ queryKey: messageKeys.all });
      });

      // New notification → refresh notification count and list
      socket.on('notification:new', () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      });

      return () => {
        socket.off('message:new');
        socket.off('notification:new');
      };
    } catch {
      // No token yet — will retry on next render
    }
  }, [isAuthenticated, queryClient]);
}
