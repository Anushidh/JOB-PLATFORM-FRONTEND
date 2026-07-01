import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Avatar, Spinner, useToast,
} from '@/components/ui';
import { useSendMessage } from '@/hooks/useMessages';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { Send } from 'lucide-react';

interface NewMessageModalProps {
  open: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientRole?: 'employee' | 'employer';
  recipientName?: string;
}

export function NewMessageModal({ open, onClose, recipientId, recipientRole, recipientName }: NewMessageModalProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string } | null>(
    recipientId ? { id: recipientId, name: recipientName || '' } : null
  );
  const [content, setContent] = useState('');
  const sendMutation = useSendMessage();
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { role: currentUserRole } = useAuthStore();

  const inferredRecipientRole = recipientRole || (currentUserRole === 'employer' ? 'employee' : 'employer') as 'employee' | 'employer';

  // Fetch applicants who applied to this employer's jobs (for employer → employee messaging)
  const { data: applicants, isLoading: applicantsLoading } = useQuery({
    queryKey: ['employer-applicants-for-messaging'],
    queryFn: async () => {
      // Get all employer's jobs, then their applicants
      const jobsRes = await api.get('/jobs/employer/my-jobs', { params: { page: 1, limit: 50 } });
      const jobs = jobsRes.data.data || [];
      const applicantMap = new Map<string, { id: string; name: string; headline?: string; avatar?: string }>();

      for (const job of jobs) {
        try {
          const appsRes = await api.get(`/applications/jobs/${job._id}/applications`, { params: { page: 1, limit: 50 } });
          const apps = appsRes.data.data || [];
          for (const app of apps) {
            const applicant = app.applicant;
            if (applicant && applicant._id && !applicantMap.has(applicant._id)) {
              applicantMap.set(applicant._id, {
                id: applicant._id,
                name: `${applicant.firstName} ${applicant.lastName}`,
                headline: applicant.headline,
                avatar: applicant.avatar,
              });
            }
          }
        } catch {}
      }
      return Array.from(applicantMap.values());
    },
    enabled: open && currentUserRole === 'employer' && !recipientId,
  });

  // Focus textarea or first focusable when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (recipientId || selectedRecipient) {
          textareaRef.current?.focus();
        }
        // If showing list, no auto-focus needed — user picks from list
      }, 100);
    }
  }, [open, recipientId, selectedRecipient]);

  // Reset state when recipientId prop changes
  useEffect(() => {
    if (recipientId) {
      setSelectedRecipient({ id: recipientId, name: recipientName || '' });
    } else {
      setSelectedRecipient(null);
    }
  }, [recipientId, recipientName]);

  // Tab trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
      'textarea, input, button:not([disabled]), select, [tabindex="0"]'
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  const handleSend = () => {
    if (!selectedRecipient?.id || !content.trim()) return;
    sendMutation.mutate(
      { recipientId: selectedRecipient.id, recipientRole: inferredRecipientRole, content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
          setSelectedRecipient(null);
          onClose();
        },
      },
    );
  };

  const showRecipientPicker = !recipientId && !selectedRecipient && currentUserRole === 'employer';

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div ref={containerRef} onKeyDown={handleKeyDown}>
        <ModalHeader onClose={onClose}>
          {selectedRecipient?.name ? `Message ${selectedRecipient.name}` : recipientName ? `Message ${recipientName}` : 'New Message'}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 pt-2">
            {/* Recipient Picker — show list of applicants */}
            {showRecipientPicker && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select recipient</label>
                {applicantsLoading ? (
                  <div className="flex justify-center py-4"><Spinner size="sm" /></div>
                ) : !applicants || applicants.length === 0 ? (
                  <p className="text-sm text-foreground-muted py-3">No applicants found. Candidates who apply to your jobs will appear here.</p>
                ) : (
                  <RecipientList
                    applicants={applicants}
                    onSelect={(applicant) => {
                      setSelectedRecipient({ id: applicant.id, name: applicant.name });
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                  />
                )}
              </div>
            )}

            {/* Selected recipient chip */}
            {selectedRecipient && !recipientId && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground-muted">To:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-sm font-medium text-primary-700">
                  {selectedRecipient.name}
                  <button
                    type="button"
                    onClick={() => setSelectedRecipient(null)}
                    className="text-primary-400 hover:text-primary-700 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {/* Message textarea */}
            {(recipientId || selectedRecipient) && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex w-full rounded-lg border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400 resize-y"
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSend}
            loading={sendMutation.isPending}
            disabled={!content.trim() || !selectedRecipient?.id}
            leftIcon={<Send />}
          >
            Send
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

/* ─── Recipient List with Search ─── */
function RecipientList({
  applicants,
  onSelect,
}: {
  applicants: Array<{ id: string; name: string; headline?: string; avatar?: string }>;
  onSelect: (applicant: { id: string; name: string }) => void;
}) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = search
    ? applicants.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : applicants;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Search */}
      <div className="px-3 py-2 border-b border-border bg-neutral-25">
        <input
          ref={searchRef}
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm bg-transparent outline-none placeholder:text-foreground-muted"
        />
      </div>

      {/* List */}
      <div className="max-h-[180px] overflow-y-auto divide-y divide-border">
        {filtered.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-4">No matches</p>
        ) : (
          filtered.map((applicant) => (
            <button
              key={applicant.id}
              type="button"
              onClick={() => onSelect(applicant)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors"
            >
              <Avatar size="sm" src={applicant.avatar} fallback={applicant.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{applicant.name}</p>
                {applicant.headline && <p className="text-xs text-foreground-muted truncate">{applicant.headline}</p>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
