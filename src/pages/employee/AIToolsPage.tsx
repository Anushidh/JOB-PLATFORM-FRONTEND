import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Select, Surface, Textarea, useToast,
} from '@/components/ui';
import { api } from '@/lib/api';
import { Sparkles, FileText, Target, Upload, ArrowRight } from 'lucide-react';
import { useCoverLetterDraftStore } from '@/stores/coverLetterDraft.store';

// Shared hook to fetch available jobs for the employee
function useAvailableJobs() {
  return useQuery({
    queryKey: ['available-jobs-for-ai'],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params: { limit: 50 } });
      return data.data;
    },
  });
}

export function EmployeeAIToolsPage() {
  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">AI Tools</Text>
          <Text variant="body" color="secondary" className="mt-1">
            AI-powered tools to accelerate your job search
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResumeParserCard />
          <CoverLetterCard />
          <MatchScoreCard />
        </div>
      </Stack>
    </Container>
  );
}

function ResumeParserCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await api.post('/ai/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data.parsed;
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Parse failed', description: error.response?.data?.message });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (parsed: any) => {
      const { data } = await api.post('/ai/apply-parsed-resume', {
        skills: parsed.skills,
        experience: parsed.experience,
        education: parsed.education,
        bio: parsed.bio,
        headline: parsed.headline,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile-completion'] });
      toast({ variant: 'success', title: 'Profile updated!', description: 'Your resume data has been saved to your profile.' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Save failed', description: error.response?.data?.message });
    },
  });

  const parsed = parseMutation.data;

  return (
    <Surface variant="elevated" padding="lg" className="md:col-span-2">
      <Stack gap={4}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
            <Upload className="size-5 text-primary-600" />
          </div>
          <div>
            <Text variant="subtitle">Resume Parser</Text>
            <Text variant="body-sm" color="secondary">Extract skills and experience from your PDF</Text>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { setFile(e.target.files?.[0] || null); parseMutation.reset(); saveMutation.reset(); }}
            className="text-sm text-foreground-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>

        <Button
          onClick={() => file && parseMutation.mutate(file)}
          disabled={!file || parseMutation.isPending}
          loading={parseMutation.isPending}
          leftIcon={<Sparkles />}
          size="sm"
        >
          Parse Resume
        </Button>

        {parsed && (
          <div className="rounded-lg border border-border bg-neutral-25 p-4 space-y-4">
            {parsed.headline && (
              <div>
                <Text variant="label" className="mb-1">Headline</Text>
                <Text variant="body-sm">{parsed.headline}</Text>
              </div>
            )}

            {parsed.bio && (
              <div>
                <Text variant="label" className="mb-1">Bio</Text>
                <Text variant="body-sm">{parsed.bio}</Text>
              </div>
            )}

            {parsed.skills?.length > 0 && (
              <div>
                <Text variant="label" className="mb-1">Skills ({parsed.skills.length})</Text>
                <div className="flex flex-wrap gap-1">
                  {parsed.skills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-200">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {parsed.experience?.length > 0 && (
              <div>
                <Text variant="label" className="mb-1">Experience ({parsed.experience.length})</Text>
                <div className="space-y-2">
                  {parsed.experience.map((exp: any, i: number) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{exp.title}</span> at <span className="text-foreground-secondary">{exp.company}</span>
                      {exp.startDate && <span className="text-foreground-muted ml-1">({exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.education?.length > 0 && (
              <div>
                <Text variant="label" className="mb-1">Education ({parsed.education.length})</Text>
                <div className="space-y-2">
                  {parsed.education.map((edu: any, i: number) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{edu.degree} in {edu.fieldOfStudy}</span> from <span className="text-foreground-secondary">{edu.institution}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => saveMutation.mutate(parsed)}
              loading={saveMutation.isPending}
              disabled={saveMutation.isSuccess}
              size="sm"
            >
              {saveMutation.isSuccess ? '✓ Saved to Profile' : 'Save to Profile'}
            </Button>
          </div>
        )}
      </Stack>
    </Surface>
  );
}

function CoverLetterCard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const setDraft = useCoverLetterDraftStore((s) => s.setDraft);
  const [jobId, setJobId] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const jobsQuery = useAvailableJobs();
  const jobs = jobsQuery.data || [];

  const generateMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.post('/ai/generate-cover-letter', { jobId });
      return data.data;
    },
    onSuccess: () => {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
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
            <Text variant="subtitle">Cover Letter Generator</Text>
            <Text variant="body-sm" color="secondary">Generate a tailored cover letter for any job</Text>
          </div>
        </div>

        <Select
          value={jobId}
          onChange={(e) => { setJobId(e.target.value); generateMutation.reset(); }}
          selectSize="sm"
          options={[
            { value: '', label: jobsQuery.isLoading ? 'Loading jobs...' : 'Select a job', disabled: true },
            ...jobs.map((job: any) => ({ value: job._id, label: `${job.title} — ${(job.company as any)?.name || 'Unknown'}` })),
          ]}
        />

        <Button
          onClick={() => generateMutation.mutate(jobId)}
          disabled={!jobId}
          loading={generateMutation.isPending}
          leftIcon={<Sparkles />}
          size="sm"
        >
          Generate
        </Button>

        {generateMutation.data?.coverLetter && (
          <div ref={resultRef}>
            <Textarea
              value={generateMutation.data.coverLetter}
              rows={6}
              readOnly
              className="bg-neutral-25"
            />
            <Button
              variant="secondary"
              leftIcon={<ArrowRight />}
              className="mt-3"
              onClick={() => {
                setDraft({ jobId, coverLetter: generateMutation.data.coverLetter });
                navigate(`/employee/jobs/${jobId}`);
              }}
            >
              Apply with this Cover Letter
            </Button>
          </div>
        )}
      </Stack>
    </Surface>
  );
}

function MatchScoreCard() {
  const { toast } = useToast();
  const [jobId, setJobId] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const jobsQuery = useAvailableJobs();
  const jobs = jobsQuery.data || [];

  const matchMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.get(`/ai/match-score/${jobId}`);
      return data.data;
    },
    onSuccess: () => {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
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
            <Text variant="subtitle">Match Score</Text>
            <Text variant="body-sm" color="secondary">See how well you match a job listing</Text>
          </div>
        </div>

        <Select
          value={jobId}
          onChange={(e) => { setJobId(e.target.value); matchMutation.reset(); }}
          selectSize="sm"
          options={[
            { value: '', label: jobsQuery.isLoading ? 'Loading jobs...' : 'Select a job', disabled: true },
            ...jobs.map((job: any) => ({ value: job._id, label: `${job.title} — ${(job.company as any)?.name || 'Unknown'}` })),
          ]}
        />

        <Button
          onClick={() => matchMutation.mutate(jobId)}
          disabled={!jobId}
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
            {matchMutation.data.explanation && (
              <Text variant="body-sm" color="muted" className="text-center">{matchMutation.data.explanation}</Text>
            )}
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
