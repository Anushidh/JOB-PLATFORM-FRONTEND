import { useState } from 'react';
import {
  Container, Stack, Text, Button, Input, Surface, Spinner, EmptyState, Avatar, useToast,
} from '@/components/ui';
import { useConversations, useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuthStore } from '@/stores/auth.store';
import type { Conversation, Message } from '@/types';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className={cn('w-[340px] shrink-0 border-r border-border flex flex-col', selectedConversation && 'hidden md:flex')}>
        <ConversationList onSelect={setSelectedConversation} selectedId={selectedConversation} />
      </div>
      <div className={cn('flex-1 flex flex-col', !selectedConversation && 'hidden md:flex')}>
        {selectedConversation ? (
          <MessageThread conversationId={selectedConversation} onBack={() => setSelectedConversation(null)} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Stack align="center" gap={2}>
              <MessageSquare className="size-12 text-foreground-muted stroke-[1.5]" />
              <Text variant="subtitle" color="secondary">Select a conversation</Text>
            </Stack>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationList({ onSelect, selectedId }: { onSelect: (id: string) => void; selectedId: string | null }) {
  const { data, isLoading } = useConversations({ page: 1, limit: 30 });

  return (
    <>
      <div className="p-4 border-b border-border"><Text variant="h5">Messages</Text></div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !data || data.length === 0 ? (
          <div className="p-6 text-center"><Text variant="body-sm" color="muted">No conversations yet</Text></div>
        ) : (
          <div className="flex flex-col">
            {data.map((conv) => (
              <ConversationItem key={conv._id} conversation={conv} isSelected={selectedId === conv._id} onClick={() => onSelect(conv._id)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ConversationItem({ conversation, isSelected, onClick }: { conversation: Conversation; isSelected: boolean; onClick: () => void }) {
  const { user } = useAuthStore();
  const other = conversation.participants.find((p) => p.userId !== user?._id);
  const lastMsg = conversation.lastMessage as Message | undefined;

  return (
    <button onClick={onClick} className={cn('flex items-center gap-3 px-4 py-3 w-full text-left transition-colors', isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50')}>
      <Avatar size="sm" fallback={other?.userId || '?'} />
      <div className="flex-1 min-w-0">
        <Text variant="body-sm" className="font-medium truncate">{other?.userId || 'User'}</Text>
        {lastMsg && <Text variant="caption" color="muted" className="truncate">{lastMsg.content}</Text>}
      </div>
      {conversation.lastMessageAt && <Text variant="caption" color="muted" className="shrink-0">{getShortTime(conversation.lastMessageAt)}</Text>}
    </button>
  );
}

function MessageThread({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data: messages, isLoading } = useMessages(conversationId, { page: 1, limit: 50 });
  const sendMutation = useSendMessage();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate(
      { recipientId: '', recipientRole: 'employee', content: newMessage.trim() },
      { onSuccess: () => setNewMessage('') },
    );
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon-sm" onClick={onBack} className="md:hidden"><ArrowLeft className="size-4" /></Button>
        <Avatar size="sm" fallback="User" />
        <Text variant="subtitle">Conversation</Text>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full"><Text variant="body-sm" color="muted">No messages yet.</Text></div>
        ) : (
          <Stack gap={3}>
            {[...messages].reverse().map((msg) => {
              const isMine = msg.sender.userId === user?._id;
              return (
                <div key={msg._id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[70%] px-4 py-2 rounded-xl', isMine ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-neutral-100 text-foreground rounded-bl-sm')}>
                    <Text variant="body-sm" className="text-inherit">{msg.content}</Text>
                    <Text variant="caption" className={cn('mt-0-5', isMine ? 'text-white/60' : 'text-foreground-muted')}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </div>
                </div>
              );
            })}
          </Stack>
        )}
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-border">
        <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1" />
        <Button type="submit" size="icon" disabled={!newMessage.trim()} loading={sendMutation.isPending}><Send className="size-4" /></Button>
      </form>
    </>
  );
}

function getShortTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
