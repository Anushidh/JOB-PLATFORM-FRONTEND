import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container, Stack, Text, Button, Input, Textarea, Select, Surface, Divider, useToast,
} from '@/components/ui';
import { useCreateJob } from '@/hooks/useJobs';
import type { CreateJobRequest } from '@/services/jobs.service';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(1, 'Location is required'),
  jobType: z.string().min(1, 'Job type is required'),
  workMode: z.string().min(1, 'Work mode is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  skillsRequired: z.string().min(1, 'At least one skill is required'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  applicationDeadline: z.string().optional(),
});

type FormData = z.infer<typeof createJobSchema>;

export function CreateJobPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const createMutation = useCreateJob();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createJobSchema),
  });

  const onSubmit = (data: FormData) => {
    const payload: CreateJobRequest = {
      title: data.title,
      description: data.description,
      location: data.location,
      jobType: data.jobType,
      workMode: data.workMode,
      experienceLevel: data.experienceLevel,
      skillsRequired: data.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
      salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? parseInt(data.salaryMax) : undefined,
      applicationDeadline: data.applicationDeadline || undefined,
    };
    createMutation.mutate(payload);
  };

  return (
    <Container size="md" className="py-6">
      <Link
        to="/employer/jobs"
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <Stack gap={6}>
        <div>
          <Text variant="h2">Post a New Job</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Fill in the details below. Your listing will be reviewed before going live.
          </Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={6}>
            {/* Basic Info */}
            <Surface variant="elevated" padding="lg">
              <Text variant="h5" className="mb-5">Basic Information</Text>
              <Stack gap={4}>
                <Input
                  label="Job Title"
                  placeholder="e.g. Senior Frontend Engineer"
                  error={errors.title?.message}
                  {...register('title')}
                />
                <Textarea
                  label="Job Description"
                  placeholder="Describe responsibilities, requirements, benefits..."
                  hint="Minimum 20 characters. Use clear formatting."
                  rows={8}
                  error={errors.description?.message}
                  {...register('description')}
                />
                <Input
                  label="Skills Required"
                  placeholder="React, TypeScript, Node.js (comma-separated)"
                  hint="Separate skills with commas"
                  error={errors.skillsRequired?.message}
                  {...register('skillsRequired')}
                />
              </Stack>
            </Surface>

            {/* Details */}
            <Surface variant="elevated" padding="lg">
              <Text variant="h5" className="mb-5">Job Details</Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="e.g. Mumbai, India"
                  error={errors.location?.message}
                  {...register('location')}
                />
                <Select
                  label="Job Type"
                  error={errors.jobType?.message}
                  {...register('jobType')}
                  options={[
                    { value: '', label: 'Select type', disabled: true },
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'contract', label: 'Contract' },
                    { value: 'internship', label: 'Internship' },
                    { value: 'freelance', label: 'Freelance' },
                  ]}
                />
                <Select
                  label="Work Mode"
                  error={errors.workMode?.message}
                  {...register('workMode')}
                  options={[
                    { value: '', label: 'Select mode', disabled: true },
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'onsite', label: 'Onsite' },
                  ]}
                />
                <Select
                  label="Experience Level"
                  error={errors.experienceLevel?.message}
                  {...register('experienceLevel')}
                  options={[
                    { value: '', label: 'Select level', disabled: true },
                    { value: 'entry', label: 'Entry Level' },
                    { value: 'mid', label: 'Mid Level' },
                    { value: 'senior', label: 'Senior' },
                    { value: 'lead', label: 'Lead' },
                    { value: 'executive', label: 'Executive' },
                  ]}
                />
              </div>
            </Surface>

            {/* Compensation */}
            <Surface variant="elevated" padding="lg">
              <Text variant="h5" className="mb-5">Compensation & Deadline</Text>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Min Salary (Annual)"
                  type="number"
                  placeholder="e.g. 800000"
                  hint="In INR"
                  {...register('salaryMin')}
                />
                <Input
                  label="Max Salary (Annual)"
                  type="number"
                  placeholder="e.g. 1500000"
                  hint="In INR"
                  {...register('salaryMax')}
                />
                <Input
                  label="Application Deadline"
                  type="date"
                  {...register('applicationDeadline')}
                />
              </div>
            </Surface>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => navigate('/employer/jobs')}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending} size="lg">
                Post Job
              </Button>
            </div>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
