import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Textarea, Surface,
  Avatar, Badge, Tabs, TabList, TabTrigger, TabContent, useToast,
} from '@/components/ui';
import { useProfileCompletion, useUpdateEmployeeProfile, useChangePassword } from '@/hooks/useUsers';
import type { UpdateEmployeeProfile } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import type { Employee } from '@/types';
import { Save, MapPin, Mail, Lock, Upload, Camera } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  headline: z.string().max(200).optional().or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  expectedSalary: z.string().optional().or(z.literal('')),
  skills: z.string().optional().or(z.literal('')),
  portfolioLinks: z.string().optional().or(z.literal('')),
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
      headline: data.headline || undefined,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      location: data.location || undefined,
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

          <TabContent value="security">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <Surface variant="elevated" padding="lg" className="mt-4">
                <Text variant="h5" className="mb-4">Change Password</Text>
                <Stack gap={4} className="max-w-sm">
                  <Input label="Current Password" type="password" leftIcon={<Lock />} error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
                  <Input label="New Password" type="password" leftIcon={<Lock />} hint="Minimum 8 characters" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
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
