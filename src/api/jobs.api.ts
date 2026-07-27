import { apiClient } from './axios';
import { ApiResponse, Job, PaginatedResponse } from '@/types';

interface JobFilters {
  page?: number;
  search?: string;
  position?: string;
  experienceRange?: string;
  status?: string;
}
export const jobsApi = {
//  getJobs: async (filters: any = {}): Promise<PaginatedResponse<Job>> => {
//     const params = new URLSearchParams();
    
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value) params.append(key, String(value));
//     });

//     const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
//       `/jobs?${params.toString()}`
//     );
//     return data.data;
//   },
getJobs: async (filters: JobFilters = {}): Promise<PaginatedResponse<Job>> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
    `/jobs?${params.toString()}`
  );
  return data.data;
},
  createJob: async (data: {
    title: string;
    position: string;
    experience: string;
    description: string;
  }): Promise<Job> => {
    const { data: response } = await apiClient.post<ApiResponse<Job>>('/jobs', data);
    return response.data;
  },

  cancelJob: async (jobId: string): Promise<Job> => {
    const { data } = await apiClient.post<ApiResponse<Job>>(`/jobs/${jobId}/cancel`);
    return data.data;
  },

  retryJob: async (jobId: string): Promise<Job> => {
    const { data } = await apiClient.post<ApiResponse<Job>>(`/jobs/${jobId}/retry`);
    return data.data;
  },
};