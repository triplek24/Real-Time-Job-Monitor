import { apiClient } from './axios';
import { ApiResponse, LoginCredentials, LoginResponse } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return data.data;
  },

  getMe: async () => {
    const { data } = await apiClient.get('/users/me');
    return data.data;
  },
};