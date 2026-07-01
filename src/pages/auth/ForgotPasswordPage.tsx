import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, Button, Input, RadioGroup, Radio, useToast } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Mail, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.email('Please enter a valid email'),
  role: z.enum(['employee', 'employer']),
});

type ForgotForm = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ref: formRef, handleKeyDown } = useFocusTrap<HTMLDivElement>();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'employee' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: ForgotForm) => {
    try {
      await authService.forgotPassword(data);
      toast({ variant: 'success', title: 'Reset code sent!', description: 'Check your email.' });
      navigate('/reset-password', { state: { email: data.email, role: data.role } });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Error', description: error.response?.data?.message || 'Something went wrong.' });
    }
  };

  return (
    <div ref={formRef} onKeyDown={handleKeyDown}>
      <Link
        to="/login"
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to login
      </Link>

      <div className="mb-8">
        <Text variant="h3">Forgot password?</Text>
        <Text variant="body" color="secondary" className="mt-1">
          No worries, we'll send you a reset code.
        </Text>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          leftIcon={<Mail />}
          error={errors.email?.message}
          {...register('email')}
        />

        <RadioGroup label="Account type" orientation="horizontal">
          <Radio
            name="role"
            value="employee"
            label="Job Seeker"
            checked={selectedRole === 'employee'}
            onChange={() => setValue('role', 'employee')}
          />
          <Radio
            name="role"
            value="employer"
            label="Employer"
            checked={selectedRole === 'employer'}
            onChange={() => setValue('role', 'employer')}
          />
        </RadioGroup>

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Send reset code
        </Button>
      </form>
    </div>
  );
}
