import { useState, useEffect } from 'react';
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
  const [editAlert, setEditAlert] = useState<JobAlert | null>(null);
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
                      onClick={() => setEditAlert(alert)}
                      aria-label="Edit alert"
                    >
                      <Edit className="size-4 text-foreground-muted" />
                    </Button>
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

        <CreateAlertModal open={showCreate || !!editAlert} onClose={() => { setShowCreate(false); setEditAlert(null); }} editAlert={editAlert} key={editAlert?._id || 'create'} />
      </Stack>
    </Container>
  );
}

function CreateAlertModal({ open, onClose, editAlert }: { open: boolean; onClose: () => void; editAlert?: JobAlert | null }) {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [jobType, setJobType] = useState<string[]>([]);
  const [workMode, setWorkMode] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('daily');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Populate form when editAlert changes
  useEffect(() => {
    if (editAlert) {
      setName(editAlert.name);
      setKeywords(editAlert.filters.keywords?.join(', ') || '');
      setLocation(editAlert.filters.location || '');
      setSkills(editAlert.filters.skills?.join(', ') || '');
      setJobType(editAlert.filters.jobType || []);
      setWorkMode(editAlert.filters.workMode || []);
      setExperienceLevel(editAlert.filters.experienceLevel || []);
      setFrequency(editAlert.frequency);
    } else {
      setName(''); setKeywords(''); setLocation(''); setSkills('');
      setJobType([]); setWorkMode([]); setExperienceLevel([]);
      setFrequency('daily');
    }
  }, [editAlert]);

  // Reset form when modal closes
  const resetForm = () => {
    setName(''); setKeywords(''); setLocation(''); setSkills('');
    setJobType([]); setWorkMode([]); setExperienceLevel([]);
    setFrequency('daily');
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => alertsService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast({ variant: 'success', title: 'Alert created!' });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => alertsService.updateAlert(editAlert!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast({ variant: 'success', title: 'Alert updated!' });
      onClose();
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  const toggleChip = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ variant: 'error', title: 'Alert name is required' });
      return;
    }

    const filters: any = {};
    if (keywords) filters.keywords = keywords.split(',').map(k => k.trim()).filter(Boolean);
    if (location) filters.location = location;
    if (skills) filters.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    if (jobType.length > 0) filters.jobType = jobType;
    if (workMode.length > 0) filters.workMode = workMode;
    if (experienceLevel.length > 0) filters.experienceLevel = experienceLevel;

    const hasAtLeastOneFilter = Object.keys(filters).length > 0;
    if (!hasAtLeastOneFilter) {
      toast({ variant: 'error', title: 'Add at least one filter (keywords, location, skills, etc.)' });
      return;
    }

    const payload = { name: name.trim(), filters, frequency };

    if (editAlert) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>{editAlert ? 'Edit Job Alert' : 'Create Job Alert'}</ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input label="Alert Name" placeholder="e.g. Frontend Remote Jobs" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Keywords" placeholder="React, TypeScript (comma-separated)" hint="Match against job title and description" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Location" placeholder="e.g. Mumbai" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input label="Skills" placeholder="Node.js, Python (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>

            <div>
              <Text variant="label" className="mb-2">Job Type</Text>
              <div className="flex flex-wrap gap-2">
                {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map(type => (
                  <button key={type} type="button" onClick={() => toggleChip(type, jobType, setJobType)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${jobType.includes(type) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-border text-foreground-secondary hover:border-foreground-muted'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Text variant="label" className="mb-2">Work Mode</Text>
              <div className="flex flex-wrap gap-2">
                {['remote', 'hybrid', 'onsite'].map(mode => (
                  <button key={mode} type="button" onClick={() => toggleChip(mode, workMode, setWorkMode)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${workMode.includes(mode) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-border text-foreground-secondary hover:border-foreground-muted'}`}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Text variant="label" className="mb-2">Experience Level</Text>
              <div className="flex flex-wrap gap-2">
                {['entry', 'mid', 'senior', 'lead', 'executive'].map(level => (
                  <button key={level} type="button" onClick={() => toggleChip(level, experienceLevel, setExperienceLevel)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${experienceLevel.includes(level) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-border text-foreground-secondary hover:border-foreground-muted'}`}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={[
                { value: 'instant', label: 'Instant — notify as soon as a match is posted' },
                { value: 'daily', label: 'Daily — digest every morning' },
                { value: 'weekly', label: 'Weekly — digest once a week' },
              ]}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>{editAlert ? 'Save Changes' : 'Create Alert'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
