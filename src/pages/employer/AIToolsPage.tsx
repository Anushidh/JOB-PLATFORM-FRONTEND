import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Select, Surface, Textarea, useToast,
} from '@/components/ui';
import { api } from '@/lib/api';
import { Sparkles, FileText, Target } from 'lucide-react';

export function EmployerAIToolsPage() {
  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">AI Tools</Text>
          <Text variant="body" color="secondary" className="mt-1">
            AI-powered tools to streamline your hiring process
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JobDescriptionGenerator />
          <ApplicantMatchCard />
        </div>
      </Stack>
    </Container>
  );
}

function JobDescriptionGenerator() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [jobType, setJobType] = useState('full-time');
  const [workMode, setWorkMode] = useState('remote');
  const [location, setLocation] = useState('');

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/ai/generate-job-description', {
        title,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        experienceLevel,
        jobType,
        workMode,
        location,
      });
      return data.data;
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Generation failed', description: error.response?.data?.message });
    },
  });

  return (
    <Surface variant="elevated" padding="lg" className="md:col-span-2">
      <Stack gap={4}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
            <FileText className="size-5 text-primary-600" />
          </div>
          <div>
            <Text variant="subtitle">Job Description Generator</Text>
            <Text variant="body-sm" color="secondary">Generate a professional job description with AI</Text>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Job Title" placeholder="e.g. Senior Backend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} inputSize="sm" />
          <Input label="Required Skills" placeholder="Node.js, PostgreSQL (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} inputSize="sm" />
          <Select label="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} selectSize="sm" options={[
            { value: 'entry', label: 'Entry' },
            { value: 'mid', label: 'Mid' },
            { value: 'senior', label: 'Senior' },
            { value: 'lead', label: 'Lead' },
          ]} />
          <Select label="Job Type" value={jobType} onChange={(e) => setJobType(e.target.value)} selectSize="sm" options={[
            { value: 'full-time', label: 'Full-time' },
            { value: 'part-time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' },
          ]} />
          <Select label="Work Mode" value={workMode} onChange={(e) => setWorkMode(e.target.value)} selectSize="sm" options={[
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'onsite', label: 'Onsite' },
          ]} />
          <Input label="Location" placeholder="e.g. Bangalore, India" value={location} onChange={(e) => setLocation(e.target.value)} inputSize="sm" />
        </div>

        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!title || !skills}
          loading={generateMutation.isPending}
          leftIcon={<Sparkles />}
        >
          Generate Description
        </Button>

        {generateMutation.data?.description && (
          <Textarea
            value={generateMutation.data.description}
            rows={10}
            readOnly
            className="bg-neutral-25 font-mono text-sm"
          />
        )}
      </Stack>
    </Surface>
  );
}

function ApplicantMatchCard() {
  const { toast } = useToast();
  const [jobId, setJobId] = useState('');
  const [applicantId, setApplicantId] = useState('');

  const matchMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/ai/applicant-match/${jobId}/${applicantId}`);
      return data.data;
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  return (
    <Surface variant="elevated" padding="lg" className="md:col-span-2">
      <Stack gap={4}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
            <Target className="size-5 text-primary-600" />
          </div>
          <div>
            <Text variant="subtitle">Applicant Match Score</Text>
            <Text variant="body-sm" color="secondary">Check how well an applicant matches your job requirements</Text>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Job ID" placeholder="Paste job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} inputSize="sm" />
          <Input label="Applicant ID" placeholder="Paste applicant ID" value={applicantId} onChange={(e) => setApplicantId(e.target.value)} inputSize="sm" />
        </div>

        <Button
          onClick={() => matchMutation.mutate()}
          disabled={!jobId || !applicantId}
          loading={matchMutation.isPending}
          leftIcon={<Target />}
          size="sm"
        >
          Check Match
        </Button>

        {matchMutation.data && (
          <div className="rounded-lg bg-neutral-50 border border-border p-4 text-center">
            <Text variant="h2" color="primary">{matchMutation.data.overallScore ?? matchMutation.data.score}%</Text>
            <Text variant="body-sm" color="secondary" className="mt-1">Match Score</Text>
          </div>
        )}
      </Stack>
    </Surface>
  );
}
