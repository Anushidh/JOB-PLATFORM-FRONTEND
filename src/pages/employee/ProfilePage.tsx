import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Textarea, Surface, Select,
  Avatar, Badge, Tabs, TabList, TabTrigger, TabContent, useToast,
} from '@/components/ui';
import { useProfileCompletion, useUpdateEmployeeProfile, useChangePassword } from '@/hooks/useUsers';
import type { UpdateEmployeeProfile } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import type { Employee } from '@/types';
import { Save, MapPin, Mail, Lock, Upload, Camera, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters'),
  lastName: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters'),
  headline: z.string().max(200, 'Max 200 characters').optional().or(z.literal('')),
  bio: z.string().max(1000, 'Max 1000 characters').optional().or(z.literal('')),
  phone: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^\+?[\d\s\-()]{7,15}$/.test(val), { message: 'Invalid phone number' }),
  location: z.string().max(100, 'Max 100 characters').optional().or(z.literal('')),
  expectedSalary: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || (Number(val) > 0 && Number.isFinite(Number(val))), { message: 'Must be a positive number' }),
  skills: z.string().optional().or(z.literal('')),
  portfolioLinks: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      const links = val.split('\n').map(s => s.trim()).filter(Boolean);
      return links.every(link => /^https?:\/\/.+\..+/.test(link));
    }, { message: 'Each line must be a valid URL (starting with http:// or https://)' }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const employee = user as Employee;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { data: completionData } = useProfileCompletion();
  const updateMutation = useUpdateEmployeeProfile();
  const passwordMutation = useChangePassword();

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/uploads/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data.data;
    },
    onSuccess: () => {
      toast({ variant: 'success', title: 'Avatar updated' });
      window.location.reload();
    },
    onError: () => { toast({ variant: 'error', title: 'Upload failed' }); },
  });

  const resumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await api.post('/uploads/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data.data;
    },
    onSuccess: () => { toast({ variant: 'success', title: 'Resume uploaded' }); },
    onError: () => { toast({ variant: 'error', title: 'Upload failed' }); },
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      headline: employee?.headline || '',
      bio: employee?.bio || '',
      phone: employee?.phone || '',
      location: employee?.location || '',
      expectedSalary: employee?.expectedSalary?.toString() || '',
      skills: employee?.skills?.join(', ') || '',
      portfolioLinks: employee?.portfolioLinks?.join('\n') || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: ProfileForm) => {
    const payload: UpdateEmployeeProfile = {
      firstName: data.firstName,
      lastName: data.lastName,
      headline: data.headline || '',
      bio: data.bio || '',
      phone: data.phone || '',
      location: data.location || '',
      expectedSalary: data.expectedSalary ? parseInt(data.expectedSalary) : undefined,
      skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      portfolioLinks: data.portfolioLinks ? data.portfolioLinks.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
    };
    updateMutation.mutate(payload);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    passwordMutation.mutate(data, { onSuccess: () => passwordForm.reset() });
  };

  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2">Profile</Text>
            <Text variant="body" color="secondary" className="mt-1">
              Manage your personal information and preferences
            </Text>
          </div>
          {completionData && (
            <Badge variant={completionData.percentage === 100 ? 'success' : 'warning'} size="lg">
              {completionData.percentage}% complete
            </Badge>
          )}
        </div>

        {/* Profile Header */}
        <Surface variant="elevated" padding="lg">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar size="2xl" src={employee?.avatar} fallback={`${employee?.firstName} ${employee?.lastName}`} />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="size-5 text-white" />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && avatarMutation.mutate(e.target.files[0])} />
            </div>
            <div>
              <Text variant="h3">{employee?.firstName} {employee?.lastName}</Text>
              {employee?.headline && <Text variant="body" color="secondary" className="mt-0.5">{employee.headline}</Text>}
              <div className="flex items-center gap-4 mt-2">
                {employee?.location && (
                  <span className="flex items-center gap-1 text-sm text-foreground-muted"><MapPin className="size-3.5" /> {employee.location}</span>
                )}
                <span className="flex items-center gap-1 text-sm text-foreground-muted"><Mail className="size-3.5" /> {employee?.email}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="xs" onClick={() => resumeInputRef.current?.click()} leftIcon={<Upload />} loading={resumeMutation.isPending}>
                  {employee?.resumePath ? 'Update Resume' : 'Upload Resume'}
                </Button>
                <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && resumeMutation.mutate(e.target.files[0])} />
              </div>
            </div>
          </div>
        </Surface>

        {/* Tabs */}
        <Tabs defaultValue="personal">
          <TabList>
            <TabTrigger value="personal">Personal Info</TabTrigger>
            <TabTrigger value="professional">Professional</TabTrigger>
            <TabTrigger value="experience">Experience</TabTrigger>
            <TabTrigger value="education">Education</TabTrigger>
            <TabTrigger value="preferences">Job Preferences</TabTrigger>
            <TabTrigger value="security">Security</TabTrigger>
          </TabList>

          <TabContent value="personal">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Surface variant="elevated" padding="lg" className="mt-4">
                <Stack gap={4}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name" error={profileForm.formState.errors.firstName?.message} {...profileForm.register('firstName')} />
                    <Input label="Last Name" error={profileForm.formState.errors.lastName?.message} {...profileForm.register('lastName')} />
                  </div>
                  <Input label="Headline" placeholder="e.g. Senior Frontend Engineer" {...profileForm.register('headline')} />
                  <Textarea label="Bio" placeholder="Tell employers about yourself..." rows={4} {...profileForm.register('bio')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Phone" placeholder="+91..." {...profileForm.register('phone')} />
                    <Input label="Location" placeholder="e.g. Mumbai, India" {...profileForm.register('location')} />
                  </div>
                </Stack>
              </Surface>
              <div className="flex justify-end mt-5">
                <Button type="submit" loading={updateMutation.isPending} disabled={!profileForm.formState.isDirty} leftIcon={<Save />}>Save Changes</Button>
              </div>
            </form>
          </TabContent>

          <TabContent value="professional">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Surface variant="elevated" padding="lg" className="mt-4">
                <Stack gap={4}>
                  <Input label="Skills" placeholder="React, TypeScript, Node.js (comma-separated)" hint="Separate skills with commas" {...profileForm.register('skills')} />
                  <Input label="Expected Salary (Annual, INR)" type="number" placeholder="e.g. 1200000" {...profileForm.register('expectedSalary')} />
                  <Textarea label="Portfolio Links" placeholder="One URL per line" hint="GitHub, personal site, etc." rows={3} {...profileForm.register('portfolioLinks')} />
                </Stack>
              </Surface>
              <div className="flex justify-end mt-5">
                <Button type="submit" loading={updateMutation.isPending} disabled={!profileForm.formState.isDirty} leftIcon={<Save />}>Save Changes</Button>
              </div>
            </form>
          </TabContent>

          <TabContent value="experience">
            <ExperienceSection employee={employee} updateMutation={updateMutation} />
          </TabContent>

          <TabContent value="education">
            <EducationSection employee={employee} updateMutation={updateMutation} />
          </TabContent>

          <TabContent value="preferences">
            <PreferencesSection employee={employee} updateMutation={updateMutation} />
          </TabContent>

          <TabContent value="security">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <Surface variant="elevated" padding="lg" className="mt-4">
                <Text variant="h5" className="mb-4">Change Password</Text>
                <Stack gap={4} className="max-w-sm">
                  <Input
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    leftIcon={<Lock />}
                    rightIcon={
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="text-foreground-muted hover:text-foreground">
                        {showCurrentPassword ? <EyeOff /> : <Eye />}
                      </button>
                    }
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register('currentPassword')}
                  />
                  <Input
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    leftIcon={<Lock />}
                    rightIcon={
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-foreground-muted hover:text-foreground">
                        {showNewPassword ? <EyeOff /> : <Eye />}
                      </button>
                    }
                    hint="Minimum 8 characters"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register('newPassword')}
                  />
                </Stack>
              </Surface>
              <div className="flex justify-end mt-5">
                <Button type="submit" loading={passwordMutation.isPending}>Update Password</Button>
              </div>
            </form>
          </TabContent>
        </Tabs>
      </Stack>
    </Container>
  );
}


/* ─── Experience Section ─── */

interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

function ExperienceSection({ employee, updateMutation }: { employee: Employee; updateMutation: any }) {
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [entries, setEntries] = useState<ExperienceEntry[]>(() =>
    (employee?.experience || []).map((e: any) => ({
      title: e.title || '',
      company: e.company || '',
      location: e.location || '',
      startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 7) : '',
      endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 7) : '',
      current: e.current || false,
      description: e.description || '',
    }))
  );

  const addEntry = () => {
    setEntries([...entries, { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' }]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
    setErrors(prev => { const n = { ...prev }; delete n[index]; return n; });
  };

  const updateEntry = (index: number, field: keyof ExperienceEntry, value: string | boolean) => {
    const updated = [...entries];
    (updated[index] as any)[field] = value;
    setEntries(updated);
    // Clear error for this field
    setErrors(prev => {
      const n = { ...prev };
      if (n[index]) { delete n[index][field]; if (Object.keys(n[index]).length === 0) delete n[index]; }
      return n;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    const now = new Date();
    entries.forEach((e, i) => {
      const errs: Record<string, string> = {};
      if (!e.title) errs.title = 'Required';
      if (!e.company) errs.company = 'Required';
      if (!e.startDate) errs.startDate = 'Required';
      if (e.startDate && new Date(e.startDate) > now) errs.startDate = 'Cannot be in the future';
      if (!e.current && e.endDate && e.startDate && new Date(e.endDate) < new Date(e.startDate)) errs.endDate = 'Must be after start date';
      if (Object.keys(errs).length > 0) newErrors[i] = errs;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast({ variant: 'error', title: 'Please fix the errors before saving' });
      return;
    }
    const payload: UpdateEmployeeProfile = {
      experience: entries.filter(e => e.title && e.company && e.startDate).map(e => ({
        title: e.title,
        company: e.company,
        location: e.location || undefined,
        startDate: e.startDate,
        endDate: e.current ? undefined : e.endDate || undefined,
        current: e.current,
        description: e.description || undefined,
      })),
    };
    updateMutation.mutate(payload);
  };

  return (
    <Stack gap={4} className="mt-4">
      {entries.map((entry, i) => (
        <Surface key={i} variant="elevated" padding="md">
          <div className="flex items-start justify-between mb-3">
            <Text variant="label">Experience {i + 1}</Text>
            <button type="button" onClick={() => removeEntry(i)} className="text-danger-600 hover:text-danger-700 p-1">
              <Trash2 className="size-4" />
            </button>
          </div>
          <Stack gap={3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Job Title" placeholder="e.g. Software Engineer" value={entry.title} onChange={(e) => updateEntry(i, 'title', e.target.value)} inputSize="sm" error={errors[i]?.title} />
              <Input label="Company" placeholder="e.g. Google" value={entry.company} onChange={(e) => updateEntry(i, 'company', e.target.value)} inputSize="sm" error={errors[i]?.company} />
            </div>
            <Input label="Location" placeholder="e.g. Mumbai" value={entry.location} onChange={(e) => updateEntry(i, 'location', e.target.value)} inputSize="sm" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Start Date" type="month" value={entry.startDate} onChange={(e) => updateEntry(i, 'startDate', e.target.value)} inputSize="sm" error={errors[i]?.startDate} />
              <Input label="End Date" type="month" value={entry.endDate} onChange={(e) => updateEntry(i, 'endDate', e.target.value)} inputSize="sm" disabled={entry.current} error={errors[i]?.endDate} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={entry.current} onChange={(e) => updateEntry(i, 'current', e.target.checked)} className="rounded" />
              Currently working here
            </label>
            <Textarea label="Description" placeholder="Brief description of your role..." rows={2} value={entry.description} onChange={(e) => updateEntry(i, 'description', e.target.value)} />
          </Stack>
        </Surface>
      ))}

      <div ref={bottomRef} className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={addEntry} leftIcon={<Plus />}>Add Experience</Button>
        <Button size="sm" onClick={handleSave} loading={updateMutation.isPending} leftIcon={<Save />}>Save Experience</Button>
      </div>
    </Stack>
  );
}

/* ─── Education Section ─── */

interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

function EducationSection({ employee, updateMutation }: { employee: Employee; updateMutation: any }) {
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [entries, setEntries] = useState<EducationEntry[]>(() =>
    (employee?.education || []).map((e: any) => ({
      institution: e.institution || '',
      degree: e.degree || '',
      fieldOfStudy: e.fieldOfStudy || '',
      startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 7) : '',
      endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 7) : '',
      current: e.current || false,
    }))
  );

  const addEntry = () => {
    setEntries([...entries, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false }]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
    setErrors(prev => { const n = { ...prev }; delete n[index]; return n; });
  };

  const updateEntry = (index: number, field: keyof EducationEntry, value: string | boolean) => {
    const updated = [...entries];
    (updated[index] as any)[field] = value;
    setEntries(updated);
    setErrors(prev => {
      const n = { ...prev };
      if (n[index]) { delete n[index][field]; if (Object.keys(n[index]).length === 0) delete n[index]; }
      return n;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    const now = new Date();
    entries.forEach((e, i) => {
      const errs: Record<string, string> = {};
      if (!e.institution) errs.institution = 'Required';
      if (!e.degree) errs.degree = 'Required';
      if (!e.fieldOfStudy) errs.fieldOfStudy = 'Required';
      if (!e.startDate) errs.startDate = 'Required';
      if (e.startDate && new Date(e.startDate) > now) errs.startDate = 'Cannot be in the future';
      if (!e.current && e.endDate && e.startDate && new Date(e.endDate) < new Date(e.startDate)) errs.endDate = 'Must be after start date';
      if (Object.keys(errs).length > 0) newErrors[i] = errs;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast({ variant: 'error', title: 'Please fix the errors before saving' });
      return;
    }
    const payload: UpdateEmployeeProfile = {
      education: entries.filter(e => e.institution && e.degree && e.fieldOfStudy && e.startDate).map(e => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        startDate: e.startDate,
        endDate: e.current ? undefined : e.endDate || undefined,
        current: e.current,
      })),
    };
    updateMutation.mutate(payload);
  };

  return (
    <Stack gap={4} className="mt-4">
      {entries.map((entry, i) => (
        <Surface key={i} variant="elevated" padding="md">
          <div className="flex items-start justify-between mb-3">
            <Text variant="label">Education {i + 1}</Text>
            <button type="button" onClick={() => removeEntry(i)} className="text-danger-600 hover:text-danger-700 p-1">
              <Trash2 className="size-4" />
            </button>
          </div>
          <Stack gap={3}>
            <Input label="Institution" placeholder="e.g. IIT Bombay" value={entry.institution} onChange={(e) => updateEntry(i, 'institution', e.target.value)} inputSize="sm" error={errors[i]?.institution} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Degree" placeholder="e.g. B.Tech" value={entry.degree} onChange={(e) => updateEntry(i, 'degree', e.target.value)} inputSize="sm" error={errors[i]?.degree} />
              <Input label="Field of Study" placeholder="e.g. Computer Science" value={entry.fieldOfStudy} onChange={(e) => updateEntry(i, 'fieldOfStudy', e.target.value)} inputSize="sm" error={errors[i]?.fieldOfStudy} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Start Date" type="month" value={entry.startDate} onChange={(e) => updateEntry(i, 'startDate', e.target.value)} inputSize="sm" error={errors[i]?.startDate} />
              <Input label="End Date" type="month" value={entry.endDate} onChange={(e) => updateEntry(i, 'endDate', e.target.value)} inputSize="sm" disabled={entry.current} error={errors[i]?.endDate} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={entry.current} onChange={(e) => updateEntry(i, 'current', e.target.checked)} className="rounded" />
              Currently studying here
            </label>
          </Stack>
        </Surface>
      ))}

      <div ref={bottomRef} className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={addEntry} leftIcon={<Plus />}>Add Education</Button>
        <Button size="sm" onClick={handleSave} loading={updateMutation.isPending} leftIcon={<Save />}>Save Education</Button>
      </div>
    </Stack>
  );
}

/* ─── Job Preferences Section ─── */

const JOB_TYPE_OPTIONS = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const WORK_MODE_OPTIONS = ['remote', 'hybrid', 'onsite'];

function PreferencesSection({ employee, updateMutation }: { employee: Employee; updateMutation: any }) {
  const [jobTypes, setJobTypes] = useState<string[]>(employee?.preferredJobType || []);
  const [workModes, setWorkModes] = useState<string[]>(employee?.preferredWorkMode || []);

  const toggleJobType = (type: string) => {
    setJobTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleWorkMode = (mode: string) => {
    setWorkModes(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  const handleSave = () => {
    const payload: UpdateEmployeeProfile = {
      preferredJobType: jobTypes,
      preferredWorkMode: workModes,
    };
    updateMutation.mutate(payload);
  };

  return (
    <Stack gap={4} className="mt-4">
      <Surface variant="elevated" padding="lg">
        <Stack gap={5}>
          <div>
            <Text variant="h5" className="mb-3">Preferred Job Type</Text>
            <Text variant="body-sm" color="secondary" className="mb-3">Select all that apply</Text>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPE_OPTIONS.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleJobType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    jobTypes.includes(type)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-border text-foreground-secondary hover:border-foreground-muted'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Text variant="h5" className="mb-3">Preferred Work Mode</Text>
            <Text variant="body-sm" color="secondary" className="mb-3">Select all that apply</Text>
            <div className="flex flex-wrap gap-2">
              {WORK_MODE_OPTIONS.map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleWorkMode(mode)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    workModes.includes(mode)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-white border-border text-foreground-secondary hover:border-foreground-muted'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Stack>
      </Surface>

      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave} loading={updateMutation.isPending} leftIcon={<Save />}>Save Preferences</Button>
      </div>
    </Stack>
  );
}
