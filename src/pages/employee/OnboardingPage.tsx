import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container, Stack, Text, Button, Input, Textarea, Select, Surface, useToast,
} from '@/components/ui';
import { useUpdateEmployeeProfile } from '@/hooks/useUsers';
import { useAuthStore } from '@/stores/auth.store';
import type { UpdateEmployeeProfile } from '@/services/users.service';
import { ArrowRight, ArrowLeft, Check, User, Briefcase, FileText, Sparkles } from 'lucide-react';

const steps = [
  { icon: <User />, label: 'About You' },
  { icon: <Briefcase />, label: 'Skills & Preferences' },
  { icon: <FileText />, label: 'Experience' },
  { icon: <Sparkles />, label: 'Finish' },
];

export function EmployeeOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    location: '',
    phone: '',
    skills: '',
    preferredJobType: [] as string[],
    preferredWorkMode: [] as string[],
    expectedSalary: '',
    experienceLevel: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const updateMutation = useUpdateEmployeeProfile();

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleFinish = () => {
    const payload: UpdateEmployeeProfile = {
      headline: formData.headline || undefined,
      bio: formData.bio || undefined,
      location: formData.location || undefined,
      phone: formData.phone || undefined,
      skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      preferredJobType: formData.preferredJobType.length > 0 ? formData.preferredJobType : undefined,
      preferredWorkMode: formData.preferredWorkMode.length > 0 ? formData.preferredWorkMode : undefined,
      expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary) : undefined,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast({ variant: 'success', title: 'Profile set up!', description: 'You\'re ready to start applying.' });
        navigate('/employee', { replace: true });
      },
    });
  };

  const handleSkip = () => {
    navigate('/employee', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="border-b border-border bg-surface-elevated">
        <Container size="md" className="py-4">
          <div className="flex items-center justify-between">
            <Text variant="h5" className="tracking-tight">
              <span className="text-primary-600">HireFlow</span> — Set up your profile
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
                <StepAbout formData={formData} updateField={updateField} firstName={user?.firstName || ''} />
              )}
              {currentStep === 1 && (
                <StepSkills formData={formData} updateField={updateField} />
              )}
              {currentStep === 2 && (
                <StepExperience formData={formData} updateField={updateField} />
              )}
              {currentStep === 3 && (
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
              <Button onClick={handleFinish} loading={updateMutation.isPending} leftIcon={<Check />}>
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: About ─── */
function StepAbout({ formData, updateField, firstName }: { formData: any; updateField: (f: string, v: string) => void; firstName: string }) {
  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Hey {firstName}, tell us about yourself</Text>
        <Text variant="body" color="secondary" className="mt-1">
          This helps employers understand who you are at a glance.
        </Text>
      </div>

      <Surface variant="elevated" padding="lg">
        <Stack gap={4}>
          <Input
            label="Professional Headline"
            placeholder="e.g. Senior Frontend Engineer | React & TypeScript"
            hint="A one-line summary of what you do"
            value={formData.headline}
            onChange={(e) => updateField('headline', e.target.value)}
          />
          <Textarea
            label="Bio"
            placeholder="Share a brief summary of your background, what drives you, and what you're looking for..."
            rows={4}
            hint="2-3 sentences is perfect"
            value={formData.bio}
            onChange={(e) => updateField('bio', e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g. Mumbai, India"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
            <Input
              label="Phone (optional)"
              placeholder="+91 ..."
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
        </Stack>
      </Surface>
    </Stack>
  );
}

/* ─── Step 2: Skills & Preferences ─── */
function StepSkills({ formData, updateField }: { formData: any; updateField: (f: string, v: any) => void }) {
  const toggleJobType = (type: string) => {
    const current = formData.preferredJobType as string[];
    updateField('preferredJobType', current.includes(type) ? current.filter((t: string) => t !== type) : [...current, type]);
  };

  const toggleWorkMode = (mode: string) => {
    const current = formData.preferredWorkMode as string[];
    updateField('preferredWorkMode', current.includes(mode) ? current.filter((m: string) => m !== mode) : [...current, mode]);
  };

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">What are your skills?</Text>
        <Text variant="body" color="secondary" className="mt-1">
          Help us match you with the right opportunities.
        </Text>
      </div>

      <Surface variant="elevated" padding="lg">
        <Stack gap={5}>
          <Input
            label="Skills"
            placeholder="React, TypeScript, Node.js, PostgreSQL..."
            hint="Comma-separated list of your top skills"
            value={formData.skills}
            onChange={(e) => updateField('skills', e.target.value)}
          />

          <div>
            <Text variant="label" className="mb-2">Preferred Job Type</Text>
            <div className="flex flex-wrap gap-2">
              {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleJobType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    (formData.preferredJobType as string[]).includes(type)
                      ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                      : 'bg-neutral-50 text-foreground-secondary hover:bg-neutral-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2">Preferred Work Mode</Text>
            <div className="flex flex-wrap gap-2">
              {['remote', 'hybrid', 'onsite'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleWorkMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    (formData.preferredWorkMode as string[]).includes(mode)
                      ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                      : 'bg-neutral-50 text-foreground-secondary hover:bg-neutral-100'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Expected Salary (Annual, INR)"
            type="number"
            placeholder="e.g. 1200000"
            hint="Optional — helps filter relevant jobs"
            value={formData.expectedSalary}
            onChange={(e) => updateField('expectedSalary', e.target.value)}
          />
        </Stack>
      </Surface>
    </Stack>
  );
}

/* ─── Step 3: Experience ─── */
function StepExperience({ formData, updateField }: { formData: any; updateField: (f: string, v: string) => void }) {
  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Where are you in your career?</Text>
        <Text variant="body" color="secondary" className="mt-1">
          This helps us recommend the right level of roles.
        </Text>
      </div>

      <Surface variant="elevated" padding="lg">
        <Stack gap={4}>
          <div>
            <Text variant="label" className="mb-3">Experience Level</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { value: 'entry', label: 'Entry Level', desc: '0-2 years' },
                { value: 'mid', label: 'Mid Level', desc: '2-5 years' },
                { value: 'senior', label: 'Senior', desc: '5-8 years' },
                { value: 'lead', label: 'Lead / Staff', desc: '8+ years' },
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateField('experienceLevel', level.value)}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                    formData.experienceLevel === level.value
                      ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                      : 'border-border hover:border-neutral-300 hover:bg-neutral-25'
                  }`}
                >
                  <Text variant="body-sm" className="font-medium">{level.label}</Text>
                  <Text variant="caption" color="muted">{level.desc}</Text>
                </button>
              ))}
            </div>
          </div>
        </Stack>
      </Surface>

      <Text variant="caption" color="muted" className="text-center">
        You can add detailed work experience and education later from your profile.
      </Text>
    </Stack>
  );
}

/* ─── Step 4: Finish ─── */
function StepFinish({ firstName }: { firstName: string }) {
  return (
    <Stack gap={5} align="center" className="text-center py-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-success-50">
        <Check className="size-8 text-success-600" />
      </div>
      <div>
        <Text variant="h3">You're all set, {firstName}!</Text>
        <Text variant="body" color="secondary" className="mt-2 max-w-sm mx-auto">
          Your profile is ready. Start browsing jobs or complete more details in your profile settings anytime.
        </Text>
      </div>
    </Stack>
  );
}
