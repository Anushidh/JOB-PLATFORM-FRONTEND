import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Text, Button, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Mail } from 'lucide-react';

export function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const { ref: formRef, handleKeyDown: trapKeyDown } = useFocusTrap<HTMLDivElement>();

  const { email, role } = (location.state as { email?: string; role?: 'employee' | 'employer' }) || {};

  useEffect(() => {
    if (!email || !role) {
      navigate('/register', { replace: true });
    }
  }, [email, role, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;

    setIsSubmitting(true);
    try {
      const verifyFn = role === 'employee' ? authService.verifyEmployeeOtp : authService.verifyEmployerOtp;
      const response = await verifyFn({ email: email!, otp: code });
      const { user, tokens, role: userRole } = response.data.data!;
      setAuth(user, userRole, tokens);
      toast({ variant: 'success', title: 'Account verified!', description: 'Welcome to HireFlow.' });
      // New user → onboarding
      navigate(userRole === 'employer' ? '/employer/onboarding' : '/employee/onboarding', { replace: true });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Verification failed', description: error.response?.data?.message || 'Invalid OTP.' });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email || !role) return null;

  return (
    <div ref={formRef} onKeyDown={trapKeyDown}>
      <div className="mb-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary-50 mb-4">
          <Mail className="size-6 text-primary-600" />
        </div>
        <Text variant="h3">Check your email</Text>
        <Text variant="body" color="secondary" className="mt-1">
          We've sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </Text>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="size-12 rounded-lg border border-border-strong bg-background text-center text-xl font-semibold text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary-400"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        <Button type="submit" fullWidth loading={isSubmitting} disabled={otp.join('').length !== 6}>
          Verify email
        </Button>
      </form>

      <Text variant="body-sm" color="muted" className="mt-4 text-center">
        Didn't receive the code? Check your spam folder.
      </Text>
    </div>
  );
}
