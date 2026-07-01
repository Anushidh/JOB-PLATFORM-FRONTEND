import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, Button, Input, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';

const schema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginForm = z.infer<typeof schema>;

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ref: formRef, handleKeyDown } = useFocusTrap<HTMLDivElement>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: AdminLoginForm) => {
    try {
      const response = await authService.loginAdmin(data);
      const { user, tokens, role } = response.data.data!;
      setAuth(user, role, tokens);
      toast({ variant: 'success', title: 'Welcome, Admin' });
      navigate('/admin', { replace: true });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Login failed', description: error.response?.data?.message || 'Invalid credentials.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div ref={formRef} onKeyDown={handleKeyDown} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary-600 mx-auto mb-4">
            <Shield className="size-6 text-white" />
          </div>
          <Text variant="h3" className="text-white">Admin Portal</Text>
          <Text variant="body-sm" className="text-neutral-400 mt-1">
            HireFlow administration
          </Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="admin@hireflow.dev"
            leftIcon={<Mail />}
            error={errors.email?.message}
            className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
            {...register('email')}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            leftIcon={<Lock />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            }
            error={errors.password?.message}
            className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
            {...register('password')}
          />
          <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
