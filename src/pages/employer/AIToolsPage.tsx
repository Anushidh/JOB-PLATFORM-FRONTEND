import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Select, Surface, Textarea, useToast,
} from '@/components/ui';
import { api } from '@/lib/api';
import { Sparkles, FileText, Target, ArrowRight } from 'lucide-react';
import { useJobDraftStore } from '@/stores/jobDraft.store';

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
  const navigate = useNavigate();
  const setDraft = useJobDraftStore((s) => s.setDraft);
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
          <Select label="Work Mode" value={workMode} onChange={(e) => {
            const newMode = e.target.value;
            setWorkMode(newMode);
            if (newMode === 'remote') {
              setLocation('Worldwide');
            } else if (location === 'Worldwide') {
              setLocation('');
            }
          }} selectSize="sm" options={[
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'onsite', label: 'Onsite' },
          ]} />
          <Input label="Location" placeholder="e.g. Bangalore, India" value={location} onChange={(e) => setLocation(e.target.value)} inputSize="sm" disabled={workMode === 'remote'} />
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

        {generateMutation.data?.description && (
          <Button
            variant="secondary"
            leftIcon={<ArrowRight />}
            onClick={() => {
              setDraft({
                title,
                description: generateMutation.data.description,
                skillsRequired: skills,
                experienceLevel,
                jobType,
                workMode,
                location,
              });
              navigate('/employer/jobs/new');
            }}
          >
            Create Job with This Description
          </Button>
        )}
      </Stack>
    </Surface>
  );
}

function ApplicantMatchCard() {
  const { toast } = useToast();
  const [jobId, setJobId] = useState('');
  const [applicantId, setApplicantId] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  // Fetch employer's jobs
  const jobsQuery = useQuery({
    queryKey: ['employer-jobs-for-match'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/employer/my-jobs', { params: { limit: 100 } });
      return data.data;
    },
  });

  // Fetch applicants for selected job
  const applicantsQuery = useQuery({
    queryKey: ['job-applicants', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/applications/jobs/${jobId}/applications`, { params: { limit: 100 } });
      return data.data;
    },
    enabled: !!jobId,
  });

  const matchMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/ai/applicant-match/${jobId}/${applicantId}`);
      return data.data;
    },
    onSuccess: () => {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  const jobs = jobsQuery.data || [];
  const applicants = applicantsQuery.data || [];

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
          <Select
            label="Select Job"
            value={jobId}
            onChange={(e) => { setJobId(e.target.value); setApplicantId(''); matchMutation.reset(); }}
            selectSize="sm"
            options={[
              { value: '', label: jobsQuery.isLoading ? 'Loading jobs...' : 'Select a job', disabled: true },
              ...jobs.map((job: any) => ({ value: job._id, label: job.title })),
            ]}
          />
          <Select
            label="Select Applicant"
            value={applicantId}
            onChange={(e) => { setApplicantId(e.target.value); matchMutation.reset(); }}
            selectSize="sm"
            disabled={!jobId || applicantsQuery.isLoading}
            options={[
              { value: '', label: !jobId ? 'Select a job first' : applicantsQuery.isLoading ? 'Loading applicants...' : applicants.length === 0 ? 'No applicants yet' : 'Select an applicant', disabled: true },
              ...applicants.map((app: any) => {
                const name = typeof app.applicant === 'object'
                  ? `${app.applicant.firstName} ${app.applicant.lastName}`
                  : 'Unknown';
                return { value: typeof app.applicant === 'object' ? app.applicant._id : app.applicant, label: name };
              }),
            ]}
          />
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
          <div ref={resultRef} className="rounded-lg bg-neutral-50 border border-border p-4">
            <div className="text-center mb-3">
              <Text variant="h2" color="primary">{matchMutation.data.overall}%</Text>
              <Text variant="body-sm" color="secondary" className="mt-1">{matchMutation.data.summary}</Text>
            </div>
            {matchMutation.data.breakdown && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                <div className="text-center p-2 rounded bg-white border border-border">
                  <Text variant="body-sm" color="secondary">Skills</Text>
                  <Text variant="subtitle">{matchMutation.data.breakdown.skills}%</Text>
                </div>
                <div className="text-center p-2 rounded bg-white border border-border">
                  <Text variant="body-sm" color="secondary">Experience</Text>
                  <Text variant="subtitle">{matchMutation.data.breakdown.experience}%</Text>
                </div>
                <div className="text-center p-2 rounded bg-white border border-border">
                  <Text variant="body-sm" color="secondary">Location</Text>
                  <Text variant="subtitle">{matchMutation.data.breakdown.location}%</Text>
                </div>
                <div className="text-center p-2 rounded bg-white border border-border">
                  <Text variant="body-sm" color="secondary">Salary</Text>
                  <Text variant="subtitle">{matchMutation.data.breakdown.salary}%</Text>
                </div>
              </div>
            )}
            {matchMutation.data.matchedSkills?.length > 0 && (
              <div className="mt-3">
                <Text variant="body-sm" color="secondary">Matched Skills:</Text>
                <div className="flex flex-wrap gap-1 mt-1">
                  {matchMutation.data.matchedSkills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {matchMutation.data.missingSkills?.length > 0 && (
              <div className="mt-2">
                <Text variant="body-sm" color="secondary">Missing Skills:</Text>
                <div className="flex flex-wrap gap-1 mt-1">
                  {matchMutation.data.missingSkills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Stack>
    </Surface>
  );
}
