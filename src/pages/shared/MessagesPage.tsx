import { useState } from 'react';
import {
  Container, Stack, Text, Button, Input, Surface, Spinner, EmptyState, Avatar, useToast,
  Dropdown, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter,
} from '@/components/ui';
import { useConversations, useMessages, useSendMessage, useDeleteConversation } from '@/hooks/useMessages';
import { useAuthStore } from '@/stores/auth.store';
import { NewMessageModal } from '@/components/NewMessageModal';
import { joinConversation, leaveConversation } from '@/lib/socket';
import type { Conversation, Message } from '@/types';
import { MessageSquare, Send, ArrowLeft, Plus, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className={cn('w-full md:w-[340px] shrink-0 border-r border-border flex flex-col', selectedConversation && 'hidden md:flex')}>
        <ConversationList onSelect={setSelectedConversation} selectedId={selectedConversation} onNewMessage={() => setShowNewMessage(true)} />
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
      <NewMessageModal open={showNewMessage} onClose={() => setShowNewMessage(false)} />
    </div>
  );
}

function ConversationList({ onSelect, selectedId, onNewMessage }: { onSelect: (id: string) => void; selectedId: string | null; onNewMessage: () => void }) {
  const { data, isLoading } = useConversations({ page: 1, limit: 30 });

  return (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Text variant="h5">Messages</Text>
        <Button variant="ghost" size="icon-sm" onClick={onNewMessage} aria-label="New message">
          <Plus className="size-4" />
        </Button>
      </div>
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
      <Avatar size="sm" src={(other as any)?.avatar} fallback={(other as any)?.name || '?'} />
      <div className="flex-1 min-w-0">
        <Text variant="body-sm" className="font-medium truncate">{(other as any)?.name || 'User'}</Text>
        {lastMsg && <Text variant="caption" color="muted" className="truncate">{lastMsg.content}</Text>}
      </div>
      {conversation.lastMessageAt && <Text variant="caption" color="muted" className="shrink-0">{getShortTime(conversation.lastMessageAt)}</Text>}
    </button>
  );
}

function MessageThread({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, role: currentUserRole } = useAuthStore();
  const { toast } = useToast();

  const { data: messages, isLoading } = useMessages(conversationId, { page: 1, limit: 50 });

  // Join socket room for real-time updates
  useEffect(() => {
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId]);

  // Get conversations to find the other participant
  const { data: conversations } = useConversations({ page: 1, limit: 30 });
  const conversation = conversations?.find((c) => c._id === conversationId);
  const other = conversation?.participants.find((p) => p.userId !== user?._id);
  const recipientId = other?.userId || '';
  const recipientRole = (other?.role || (currentUserRole === 'employer' ? 'employee' : 'employer')) as 'employee' | 'employer';

  const sendMutation = useSendMessage();
  const deleteConvMutation = useDeleteConversation();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientId) return;
    sendMutation.mutate(
      { recipientId, recipientRole, content: newMessage.trim() },
      { onSuccess: () => setNewMessage('') },
    );
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon-sm" onClick={onBack} className="md:hidden"><ArrowLeft className="size-4" /></Button>
        <Avatar size="sm" src={(other as any)?.avatar} fallback={(other as any)?.name || 'User'} />
        <Text variant="subtitle" className="flex-1">{(other as any)?.name || 'Conversation'}</Text>
        <Dropdown
          trigger={<Button variant="ghost" size="icon-sm"><MoreVertical className="size-4" /></Button>}
          align="end"
        >
          <DropdownItem
            icon={<Trash2 />}
            destructive
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete conversation
          </DropdownItem>
        </Dropdown>
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
        <div className="flex-1">
          <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        </div>
        <Button type="submit" size="icon" disabled={!newMessage.trim()} loading={sendMutation.isPending}><Send className="size-4" /></Button>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} size="sm">
        <ModalHeader onClose={() => setShowDeleteConfirm(false)}>Delete conversation</ModalHeader>
        <ModalBody>
          <Text variant="body" color="secondary">
            This will remove the conversation from your view only. The other person will still be able to see it.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteConvMutation.mutate(conversationId);
              setShowDeleteConfirm(false);
              onBack();
            }}
            loading={deleteConvMutation.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
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
