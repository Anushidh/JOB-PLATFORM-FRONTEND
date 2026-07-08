import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container, Stack, Text, Button, Input, Textarea, Select, Surface, Spinner, useToast,
} from '@/components/ui';
import { useMyCompany, useCreateCompany, useUpdateCompany, useUploadCompanyLogo, useUploadCompanyBanner } from '@/hooks/useCompanies';
import type { Company } from '@/types';
import { Building2, Save, Globe, MapPin, Upload, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';

const companySchema = z.object({
  name: z.string().min(2, 'Company name required').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  size: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  foundedYear: z.string().optional().or(z.literal('')),
});

type CompanyForm = z.infer<typeof companySchema>;

export function CompanyPage() {
  const { data: company, isLoading } = useMyCompany();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany(company?._id || '');
  const uploadLogoMutation = useUploadCompanyLogo();
  const uploadBannerMutation = useUploadCompanyBanner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    values: company ? {
      name: company.name,
      description: company.description || '',
      website: company.website || '',
      industry: company.industry || '',
      size: company.size || '',
      location: company.location || '',
      foundedYear: company.foundedYear?.toString() || '',
    } : undefined,
  });

  const onSubmit = (data: CompanyForm) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      website: data.website || undefined,
      industry: data.industry || undefined,
      size: data.size || undefined,
      location: data.location || undefined,
      foundedYear: data.foundedYear ? parseInt(data.foundedYear) : undefined,
    };

    if (company) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload as { name: string });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  return (
    <Container size="md" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">{company ? 'Company Profile' : 'Set Up Your Company'}</Text>
          <Text variant="body" color="secondary" className="mt-1">
            {company ? 'Manage your company information' : 'Create a company profile to start posting jobs'}
          </Text>
        </div>

        {company && (
          <Surface variant="flat" padding="none" className="overflow-hidden">
            {/* Banner Section */}
            <div 
              className="relative h-48 sm:h-64 bg-neutral-100 group cursor-pointer border-b border-border"
              onClick={() => bannerInputRef.current?.click()}
            >
              {company.bannerUrl ? (
                <img src={company.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-foreground-muted">
                  <ImageIcon className="size-10 mb-2 opacity-50" />
                  <Text variant="body-sm">Click to upload banner (16:9)</Text>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                {uploadBannerMutation.isPending ? (
                  <Spinner size="md" className="text-white" />
                ) : (
                  <>
                    <Upload className="size-6 mb-2" />
                    <Text variant="body-sm" className="text-white">Change Banner</Text>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={bannerInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    uploadBannerMutation.mutate(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Logo Section */}
            <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-12 relative">
              <div 
                className="relative size-24 group cursor-pointer rounded-xl bg-white p-1 shadow-sm border border-border"
                onClick={() => fileInputRef.current?.click()}
              >
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="size-full rounded-lg object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-lg bg-neutral-100">
                    <Building2 className="size-10 text-foreground-muted" />
                  </div>
                )}
                <div className="absolute inset-1 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadLogoMutation.isPending ? <Spinner size="sm" className="text-white" /> : <Upload className="size-6 text-white" />}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      uploadLogoMutation.mutate(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <div className="flex-1 pb-1">
                <Text variant="h3" className="drop-shadow-sm">{company.name}</Text>
                <Text variant="body-sm" color="secondary">Update your logo and banner to stand out.</Text>
              </div>
            </div>
          </Surface>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={5}>
            <Surface variant="elevated" padding="lg">
              <Text variant="h5" className="mb-5">Company Details</Text>
              <Stack gap={4}>
                <Input label="Company Name" placeholder="e.g. Acme Corp" error={errors.name?.message} {...register('name')} />
                <Textarea label="Description" placeholder="What does your company do?" rows={4} {...register('description')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Website" placeholder="https://..." leftIcon={<Globe />} error={errors.website?.message} {...register('website')} />
                  <Input label="Location" placeholder="e.g. Mumbai, India" leftIcon={<MapPin />} {...register('location')} />
                  <Select label="Industry" {...register('industry')} options={[
                    { value: '', label: 'Select industry' },
                    { value: 'Technology', label: 'Technology' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Healthcare', label: 'Healthcare' },
                    { value: 'Education', label: 'Education' },
                    { value: 'E-commerce', label: 'E-commerce' },
                    { value: 'Manufacturing', label: 'Manufacturing' },
                    { value: 'Consulting', label: 'Consulting' },
                    { value: 'Other', label: 'Other' },
                  ]} />
                  <Select label="Company Size" {...register('size')} options={[
                    { value: '', label: 'Select size' },
                    { value: '1-10', label: '1–10 employees' },
                    { value: '11-50', label: '11–50 employees' },
                    { value: '51-200', label: '51–200 employees' },
                    { value: '201-500', label: '201–500 employees' },
                    { value: '501-1000', label: '501–1000 employees' },
                    { value: '1000+', label: '1000+ employees' },
                  ]} />
                  <Input label="Founded Year" type="number" placeholder="e.g. 2018" {...register('foundedYear')} />
                </div>
              </Stack>
            </Surface>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                disabled={company ? !isDirty : false}
                leftIcon={company ? <Save /> : <Building2 />}
              >
                {company ? 'Save Changes' : 'Create Company'}
              </Button>
            </div>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
