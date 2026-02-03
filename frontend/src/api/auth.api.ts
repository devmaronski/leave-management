import apiClient from './axios';
import type { LoginRequest, LoginResponse, AuthUser } from '@/types/models';

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};
