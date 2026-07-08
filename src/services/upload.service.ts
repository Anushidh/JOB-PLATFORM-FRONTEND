import { api, type ApiResponse } from '@/lib/api';

export const uploadService = {
  uploadCompanyLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post<ApiResponse<{ url: string; publicId: string }>>('/uploads/company-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadCompanyBanner: (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    return api.post<ApiResponse<{ url: string; publicId: string }>>('/uploads/company-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
