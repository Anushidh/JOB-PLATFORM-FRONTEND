import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Input, Surface, Textarea, Spinner, useToast,
} from '@/components/ui';
import { api } from '@/lib/api';
import { Sparkles, FileText, Target, Upload } from 'lucide-react';

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
  const [file, setFile] = useState<File | null>(null);

  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await api.post('/ai/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      toast({ variant: 'success', title: 'Resume parsed!', description: 'Review the extracted data on your profile.' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Parse failed', description: error.response?.data?.message });
    },
  });

  return (
    <Surface variant="elevated" padding="lg">
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
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-foreground-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>

        <Button
          onClick={() => file && parseMutation.mutate(file)}
          disabled={!file}
          loading={parseMutation.isPending}
          leftIcon={<Sparkles />}
          size="sm"
        >
          Parse Resume
        </Button>

        {parseMutation.data && (
          <div className="rounded-lg bg-success-50 border border-success-100 p-3">
            <Text variant="body-sm" color="success">Resume parsed successfully. Check your profile to review.</Text>
          </div>
        )}
      </Stack>
    </Surface>
  );
}

function CoverLetterCard() {
  const { toast } = useToast();
  const [jobId, setJobId] = useState('');

  const generateMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.post('/ai/generate-cover-letter', { jobId });
      return data.data;
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Generation failed', description: error.response?.data?.message });
    },
  });

  return (
    <Surface variant="elevated" padding="lg">
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

        <Input
          placeholder="Paste Job ID"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          inputSize="sm"
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
          <Textarea
            value={generateMutation.data.coverLetter}
            rows={6}
            readOnly
            className="bg-neutral-25"
          />
        )}
      </Stack>
    </Surface>
  );
}

function MatchScoreCard() {
  const { toast } = useToast();
  const [jobId, setJobId] = useState('');

  const matchMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.get(`/ai/match-score/${jobId}`);
      return data.data;
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  return (
    <Surface variant="elevated" padding="lg">
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

        <Input
          placeholder="Paste Job ID"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          inputSize="sm"
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
          <div className="rounded-lg bg-neutral-50 border border-border p-4 text-center">
            <Text variant="h2" color="primary">{matchMutation.data.overallScore ?? matchMutation.data.score}%</Text>
            <Text variant="body-sm" color="secondary" className="mt-1">Match Score</Text>
            {matchMutation.data.explanation && (
              <Text variant="caption" color="muted" className="mt-2">{matchMutation.data.explanation}</Text>
            )}
          </div>
        )}
      </Stack>
    </Surface>
  );
}
