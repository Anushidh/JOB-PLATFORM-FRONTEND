import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Surface, Avatar, Badge,
  Tabs, TabList, TabTrigger, TabContent, useToast,
} from '@/components/ui';
import { useUpdateEmployerProfile, useProfileCompletion } from '@/hooks/useUsers';
import { useChangePassword } from '@/hooks/useUsers';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import type { Employer } from '@/types';
import { Save, Mail, Lock, Camera } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().optional().or(z.literal('')),
  position: z.string().max(100).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function EmployerProfilePage() {
  const { user, setUser, role } = useAuthStore();
  const employer = user as Employer;
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: completionData } = useProfileCompletion();
  const updateMutation = useUpdateEmployerProfile();
  const passwordMutation = useChangePassword();

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/uploads/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data.data;
    },
    onSuccess: (data) => {
      setUser({ ...employer, avatar: data.url }, role!);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({ variant: 'success', title: 'Profile picture updated' });
    },
    onError: () => { toast({ variant: 'error', title: 'Upload failed' }); },
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: employer?.firstName || '',
      lastName: employer?.lastName || '',
      phone: employer?.phone || '',
      position: employer?.position || '',
      department: employer?.department || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || '',
      position: data.position || '',
      department: data.department || '',
    });
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    passwordMutation.mutate(data, {
      onSuccess: () => passwordForm.reset(),
    });
  };

  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2">Profile & Settings</Text>
            <Text variant="body" color="secondary" className="mt-1">
              Manage your account information
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
              <Avatar size="2xl" src={employer?.avatar} fallback={`${employer?.firstName} ${employer?.lastName}`} />
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
              <Text variant="h3">{employer?.firstName} {employer?.lastName}</Text>
              {employer?.position && <Text variant="body" color="secondary">{employer.position}</Text>}
              <span className="flex items-center gap-1 text-sm text-foreground-muted mt-1">
                <Mail className="size-3.5" /> {employer?.email}
              </span>
            </div>
          </div>
        </Surface>

        <Tabs defaultValue="profile">
          <TabList>
            <TabTrigger value="profile">Profile</TabTrigger>
            <TabTrigger value="security">Security</TabTrigger>
          </TabList>

          <TabContent value="profile">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Surface variant="elevated" padding="lg" className="mt-4">
                <Stack gap={4}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name" error={profileForm.formState.errors.firstName?.message} {...profileForm.register('firstName')} />
                    <Input label="Last Name" error={profileForm.formState.errors.lastName?.message} {...profileForm.register('lastName')} />
                    <Input label="Phone" placeholder="+91..." {...profileForm.register('phone')} />
                    <Input label="Position" placeholder="e.g. CTO" {...profileForm.register('position')} />
                    <Input label="Department" placeholder="e.g. Engineering" {...profileForm.register('department')} />
                  </div>
                </Stack>
              </Surface>
              <div className="flex justify-end mt-5">
                <Button type="submit" loading={updateMutation.isPending} disabled={!profileForm.formState.isDirty} leftIcon={<Save />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </TabContent>

          <TabContent value="security">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <Surface variant="elevated" padding="lg" className="mt-4">
                <Text variant="h5" className="mb-4">Change Password</Text>
                <Stack gap={4} className="max-w-sm">
                  <Input
                    label="Current Password"
                    type="password"
                    leftIcon={<Lock />}
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register('currentPassword')}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    leftIcon={<Lock />}
                    hint="Minimum 8 characters"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register('newPassword')}
                  />
                </Stack>
              </Surface>
              <div className="flex justify-end mt-5">
                <Button type="submit" loading={passwordMutation.isPending}>
                  Update Password
                </Button>
              </div>
            </form>
          </TabContent>
        </Tabs>
      </Stack>
    </Container>
  );
}
