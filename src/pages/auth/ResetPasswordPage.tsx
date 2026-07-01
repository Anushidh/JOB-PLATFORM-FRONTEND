import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, Button, Input, useToast } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { useEffect } from 'react';

const schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'Must be numeric'),
  newPassword: z.string().min(8, 'At least 8 characters'),
});

type ResetForm = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { ref: formRef, handleKeyDown } = useFocusTrap<HTMLDivElement>();

  const { email, role } = (location.state as { email?: string; role?: 'employee' | 'employer' }) || {};

  useEffect(() => {
    if (!email || !role) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, role, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ResetForm) => {
    try {
      await authService.resetPassword({ email: email!, role: role!, otp: data.otp, newPassword: data.newPassword });
      toast({ variant: 'success', title: 'Password reset!', description: 'You can now sign in with your new password.' });
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Reset failed', description: error.response?.data?.message || 'Invalid OTP or something went wrong.' });
    }
  };

  if (!email || !role) return null;

  return (
    <div ref={formRef} onKeyDown={handleKeyDown}>
      <Link
        to="/forgot-password"
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="mb-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary-50 mb-4">
          <KeyRound className="size-6 text-primary-600" />
        </div>
        <Text variant="h3">Set new password</Text>
        <Text variant="body" color="secondary" className="mt-1">
          Enter the code sent to <span className="font-medium text-foreground">{email}</span> and your new password.
        </Text>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Verification code"
          placeholder="Enter 6-digit code"
          maxLength={6}
          error={errors.otp?.message}
          {...register('otp')}
        />
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 characters"
          leftIcon={<Lock />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Reset password
        </Button>
      </form>
    </div>
  );
}
