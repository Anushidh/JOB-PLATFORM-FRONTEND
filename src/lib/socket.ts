import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No access token');

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinConversation(conversationId: string): void {
  socket?.emit('conversation:join', conversationId);
}

export function leaveConversation(conversationId: string): void {
  socket?.emit('conversation:leave', conversationId);
}

export function emitTypingStart(conversationId: string): void {
  socket?.emit('typing:start', { conversationId });
}

export function emitTypingStop(conversationId: string): void {
  socket?.emit('typing:stop', { conversationId });
}
