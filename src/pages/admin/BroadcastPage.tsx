import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Textarea, Select, Surface, useToast,
} from '@/components/ui';
import { api } from '@/lib/api';
import { Send, Megaphone } from 'lucide-react';

export function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const { toast } = useToast();

  const broadcastMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/admin/broadcast', { title, message, target });
      return data.data;
    },
    onSuccess: (data) => {
      toast({ variant: 'success', title: 'Broadcast sent!', description: `Notification delivered to ${data.recipientCount} users.` });
      setTitle('');
      setMessage('');
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  return (
    <Container size="md" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Broadcast</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Send a notification to all users or a specific segment
          </Text>
        </div>

        <Surface variant="elevated" padding="lg">
          <Stack gap={5}>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                <Megaphone className="size-5 text-primary-600" />
              </div>
              <div>
                <Text variant="subtitle">New Announcement</Text>
                <Text variant="body-sm" color="muted">This will create a notification for selected users</Text>
              </div>
            </div>

            <Select
              label="Target Audience"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              options={[
                { value: 'all', label: 'All Users' },
                { value: 'employees', label: 'Job Seekers Only' },
                { value: 'employers', label: 'Employers Only' },
              ]}
            />

            <Input
              label="Title"
              placeholder="e.g. New Feature Available!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Textarea
              label="Message"
              placeholder="Write your announcement message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              hint="Keep it concise and actionable"
            />

            <div className="flex justify-end">
              <Button
                onClick={() => broadcastMutation.mutate()}
                loading={broadcastMutation.isPending}
                disabled={!title.trim() || !message.trim()}
                leftIcon={<Send />}
              >
                Send Broadcast
              </Button>
            </div>
          </Stack>
        </Surface>
      </Stack>
    </Container>
  );
}
