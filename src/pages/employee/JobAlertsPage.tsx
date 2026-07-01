import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Select, Badge, Surface, Spinner, EmptyState,
  Modal, ModalHeader, ModalBody, ModalFooter, useToast,
} from '@/components/ui';
import { api, type ApiResponse } from '@/lib/api';
import type { JobAlert } from '@/types';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Edit } from 'lucide-react';

const alertsService = {
  getMyAlerts: () => api.get<ApiResponse<JobAlert[]>>('/job-alerts'),
  createAlert: (data: any) => api.post<ApiResponse<JobAlert>>('/job-alerts', data),
  updateAlert: (alertId: string, data: any) => api.put<ApiResponse<JobAlert>>(`/job-alerts/${alertId}`, data),
  deleteAlert: (alertId: string) => api.delete<ApiResponse<null>>(`/job-alerts/${alertId}`),
  toggleAlert: (alertId: string) => api.patch<ApiResponse<JobAlert>>(`/job-alerts/${alertId}/toggle`),
};

export function JobAlertsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['job-alerts'],
    queryFn: async () => {
      const { data } = await alertsService.getMyAlerts();
      return data.data!;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (alertId: string) => alertsService.deleteAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast({ variant: 'success', title: 'Alert deleted' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (alertId: string) => alertsService.toggleAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
    },
  });

  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2">Job Alerts</Text>
            <Text variant="body" color="secondary" className="mt-1">
              Get notified when jobs matching your criteria are posted
            </Text>
          </div>
          <Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>
            New Alert
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : !alerts || alerts.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            title="No job alerts"
            description="Create an alert to get notified when matching jobs are posted."
            action={<Button leftIcon={<Plus />} onClick={() => setShowCreate(true)}>Create Alert</Button>}
          />
        ) : (
          <Stack gap={3}>
            {alerts.map((alert) => (
              <Surface key={alert._id} variant="elevated" padding="md">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Text variant="subtitle">{alert.name}</Text>
                      <Badge variant={alert.isActive ? 'success' : 'default'} size="sm" dot>
                        {alert.isActive ? 'Active' : 'Paused'}
                      </Badge>
                      <Badge variant="outline" size="sm">{alert.frequency}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alert.filters.keywords?.map((k) => (
                        <span key={k} className="px-2 py-0.5 rounded-md bg-neutral-50 text-xs text-foreground-secondary">{k}</span>
                      ))}
                      {alert.filters.location && (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-50 text-xs text-foreground-secondary">{alert.filters.location}</span>
                      )}
                      {alert.filters.jobType?.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-primary-50 text-xs text-primary-700">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleMutation.mutate(alert._id)}
                      aria-label={alert.isActive ? 'Pause alert' : 'Activate alert'}
                    >
                      {alert.isActive ? <ToggleRight className="size-5 text-success-600" /> : <ToggleLeft className="size-5 text-foreground-muted" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteMutation.mutate(alert._id)}
                      className="text-foreground-muted hover:text-danger-600"
                      aria-label="Delete alert"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Surface>
            ))}
          </Stack>
        )}

        <CreateAlertModal open={showCreate} onClose={() => setShowCreate(false)} />
      </Stack>
    </Container>
  );
}

function CreateAlertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: any) => alertsService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast({ variant: 'success', title: 'Alert created!' });
      onClose();
      setName('');
      setKeywords('');
      setLocation('');
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      filters: {
        keywords: keywords ? keywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined,
        location: location || undefined,
      },
      frequency,
    });
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>Create Job Alert</ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input label="Alert Name" placeholder="e.g. Frontend Remote Jobs" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Keywords" placeholder="React, TypeScript (comma-separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            <Input label="Location" placeholder="e.g. Mumbai" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Select
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={[
                { value: 'instant', label: 'Instant' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ]}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createMutation.isPending} disabled={!name}>Create</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
