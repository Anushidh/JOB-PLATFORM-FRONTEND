import { api, type ApiResponse } from '@/lib/api';

export const uploadService = {
  uploadCompanyLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post<ApiResponse<{ url: string; publicId: string }>>('/uploads/company-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
