import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Textarea, Select, Surface, useToast,
} from '@/components/ui';
import { useUpdateEmployerProfile } from '@/hooks/useUsers';
import { companiesService } from '@/services/companies.service';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowRight, ArrowLeft, Check, Building2, User, Sparkles } from 'lucide-react';

const steps = [
  { icon: <Building2 />, label: 'Company' },
  { icon: <User />, label: 'Your Role' },
  { icon: <Sparkles />, label: 'Finish' },
];

export function EmployerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    description: '',
    position: '',
    department: '',
    phone: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const updateProfileMutation = useUpdateEmployerProfile();

  const createCompanyMutation = useMutation({
    mutationFn: () => companiesService.createCompany({
      name: formData.companyName,
      industry: formData.industry || undefined,
      size: formData.size || undefined,
      location: formData.location || undefined,
      website: formData.website || undefined,
      description: formData.description || undefined,
    }),
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    try {
      // Create company first
      if (formData.companyName) {
        await createCompanyMutation.mutateAsync();
      }

      // Update employer profile
      await updateProfileMutation.mutateAsync({
        position: formData.position || undefined,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
      });

      toast({ variant: 'success', title: 'You\'re all set!', description: 'Start posting jobs.' });
      navigate('/employer', { replace: true });
    } catch (error: any) {
      toast({ variant: 'error', title: 'Setup failed', description: error.response?.data?.message || 'Please try again.' });
    }
  };

  const handleSkip = () => {
    navigate('/employer', { replace: true });
  };

  const isLoading = createCompanyMutation.isPending || updateProfileMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="border-b border-border bg-surface-elevated">
        <Container size="md" className="py-4">
          <div className="flex items-center justify-between">
            <Text variant="h5" className="tracking-tight">
              <span className="text-primary-600">HireFlow</span> — Set up your company
            </Text>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i < currentStep
                    ? 'bg-primary-600 text-white'
                    : i === currentStep
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                      : 'bg-neutral-100 text-foreground-muted'
                }`}>
                  {i < currentStep ? <Check className="size-3.5" /> : i + 1}
                </div>
                <Text variant="caption" color={i === currentStep ? 'default' : 'muted'} className="hidden sm:block">
                  {step.label}
                </Text>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${i < currentStep ? 'bg-primary-300' : 'bg-neutral-200'}`} />
                )}
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center py-10 px-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {currentStep === 0 && (
                <StepCompany formData={formData} updateField={updateField} />
              )}
              {currentStep === 1 && (
                <StepRole formData={formData} updateField={updateField} />
              )}
              {currentStep === 2 && (
                <StepFinish firstName={user?.firstName || ''} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={currentStep === 0}
              leftIcon={<ArrowLeft />}
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={next} rightIcon={<ArrowRight />}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleFinish} loading={isLoading} leftIcon={<Check />}>
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Company ─── */
function StepCompany({ formData, updateField }: { formData: any; updateField: (f: string, v: string) => void }) {
  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Tell us about your company</Text>
        <Text variant="body" color="secondary" className="mt-1">
          This will be visible to candidates browsing your job listings.
        </Text>
      </div>

      <Surface variant="elevated" padding="lg">
        <Stack gap={4}>
          <Input
            label="Company Name"
            placeholder="e.g. Acme Technologies"
            value={formData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
          />
          <Textarea
            label="Description (optional)"
            placeholder="What does your company do? What's the culture like?"
            rows={3}
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Industry"
              value={formData.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              options={[
                { value: '', label: 'Select industry' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Education', label: 'Education' },
                { value: 'E-commerce', label: 'E-commerce' },
                { value: 'Manufacturing', label: 'Manufacturing' },
                { value: 'Consulting', label: 'Consulting' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              label="Company Size"
              value={formData.size}
              onChange={(e) => updateField('size', e.target.value)}
              options={[
                { value: '', label: 'Select size' },
                { value: '1-10', label: '1–10 employees' },
                { value: '11-50', label: '11–50 employees' },
                { value: '51-200', label: '51–200 employees' },
                { value: '201-500', label: '201–500 employees' },
                { value: '501-1000', label: '501–1000 employees' },
                { value: '1000+', label: '1000+ employees' },
              ]}
            />
            <Input
              label="Location"
              placeholder="e.g. Mumbai, India"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
            <Input
              label="Website (optional)"
              placeholder="https://..."
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
            />
          </div>
        </Stack>
      </Surface>
    </Stack>
  );
}

/* ─── Step 2: Role ─── */
function StepRole({ formData, updateField }: { formData: any; updateField: (f: string, v: string) => void }) {
  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">What's your role?</Text>
        <Text variant="body" color="secondary" className="mt-1">
          Help candidates know who they'll be working with.
        </Text>
      </div>

      <Surface variant="elevated" padding="lg">
        <Stack gap={4}>
          <Input
            label="Your Position"
            placeholder="e.g. Head of Engineering, CTO, HR Manager"
            value={formData.position}
            onChange={(e) => updateField('position', e.target.value)}
          />
          <Input
            label="Department"
            placeholder="e.g. Engineering, Product, Human Resources"
            value={formData.department}
            onChange={(e) => updateField('department', e.target.value)}
          />
          <Input
            label="Phone (optional)"
            placeholder="+91 ..."
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </Stack>
      </Surface>
    </Stack>
  );
}

/* ─── Step 3: Finish ─── */
function StepFinish({ firstName }: { firstName: string }) {
  return (
    <Stack gap={5} align="center" className="text-center py-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-success-50">
        <Check className="size-8 text-success-600" />
      </div>
      <div>
        <Text variant="h3">Ready to hire, {firstName}!</Text>
        <Text variant="body" color="secondary" className="mt-2 max-w-sm mx-auto">
          Your company profile is set up. Start posting jobs and find the perfect candidates.
        </Text>
      </div>
    </Stack>
  );
}
