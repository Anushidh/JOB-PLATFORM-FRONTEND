import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, Button, Input, Tabs, TabList, TabTrigger, TabContent, useToast } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

/* ─── Schemas ─── */
const employeeSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters'),
});

const employerSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters'),
  position: z.string().optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;
type EmployerForm = z.infer<typeof employerSchema>;

export function RegisterPage() {
  const [activeRole, setActiveRole] = useState<'employee' | 'employer'>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ref: formRef, handleKeyDown } = useFocusTrap<HTMLDivElement>();

  const employeeForm = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  const employerForm = useForm<EmployerForm>({
    resolver: zodResolver(employerSchema),
  });

  const onEmployeeSubmit = async (data: EmployeeForm) => {
    try {
      await authService.initiateEmployeeRegistration(data);
      toast({ variant: 'success', title: 'Verification code sent!', description: 'Check your email for the OTP.' });
      navigate('/verify-otp', { state: { email: data.email, role: 'employee' } });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Registration failed', description: error.response?.data?.message || 'Please try again.' });
    }
  };

  const onEmployerSubmit = async (data: EmployerForm) => {
    try {
      await authService.initiateEmployerRegistration(data);
      toast({ variant: 'success', title: 'Verification code sent!', description: 'Check your email for the OTP.' });
      navigate('/verify-otp', { state: { email: data.email, role: 'employer' } });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Registration failed', description: error.response?.data?.message || 'Please try again.' });
    }
  };

  const handleOAuth = (provider: 'google' | 'linkedin') => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${baseUrl}/auth/oauth/${provider}?role=${activeRole}`;
  };

  return (
    <div ref={formRef} onKeyDown={handleKeyDown}>
      <div className="mb-8 text-center">
        <Text variant="h3">Create your account</Text>
        <Text variant="body" color="secondary" className="mt-1">
          Get started in less than a minute
        </Text>
      </div>

      <Tabs defaultValue="employee" onChange={(v) => setActiveRole(v as 'employee' | 'employer')}>
        <TabList className="mb-6">
          <TabTrigger value="employee">Job Seeker</TabTrigger>
          <TabTrigger value="employer">Employer</TabTrigger>
        </TabList>

        <TabContent value="employee">
          <form onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="John"
                leftIcon={<User />}
                error={employeeForm.formState.errors.firstName?.message}
                {...employeeForm.register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                error={employeeForm.formState.errors.lastName?.message}
                {...employeeForm.register('lastName')}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="name@email.com"
              leftIcon={<Mail />}
              error={employeeForm.formState.errors.email?.message}
              {...employeeForm.register('email')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              leftIcon={<Lock />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              }
              error={employeeForm.formState.errors.password?.message}
              {...employeeForm.register('password')}
            />
            <Button type="submit" fullWidth loading={employeeForm.formState.isSubmitting} className="mt-2">
              Create account
            </Button>
          </form>
        </TabContent>

        <TabContent value="employer">
          <form onSubmit={employerForm.handleSubmit(onEmployerSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="Jane"
                leftIcon={<User />}
                error={employerForm.formState.errors.firstName?.message}
                {...employerForm.register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Smith"
                error={employerForm.formState.errors.lastName?.message}
                {...employerForm.register('lastName')}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              leftIcon={<Mail />}
              error={employerForm.formState.errors.email?.message}
              {...employerForm.register('email')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              leftIcon={<Lock />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              }
              error={employerForm.formState.errors.password?.message}
              {...employerForm.register('password')}
            />
            <Input
              label="Position (optional)"
              placeholder="e.g. Head of Engineering"
              error={employerForm.formState.errors.position?.message}
              {...employerForm.register('position')}
            />
            <Button type="submit" fullWidth loading={employerForm.formState.isSubmitting} className="mt-2">
              Create employer account
            </Button>
          </form>
        </TabContent>
      </Tabs>

      {/* OAuth */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <Text variant="caption" color="muted" className="shrink-0">
          or sign up with
        </Text>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => handleOAuth('google')}
          leftIcon={
            <svg className="size-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          }
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => handleOAuth('linkedin')}
          leftIcon={
            <svg className="size-4" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          }
        >
          LinkedIn
        </Button>
      </div>

      <div className="mt-6 text-center">
        <Text variant="body-sm" color="secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
