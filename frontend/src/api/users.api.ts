import apiClient from './axios';
import type { User, CreateUserDto, UserFilterDto, PaginatedResponse } from '../types/models';

export const getUsers = async (filters?: UserFilterDto): Promise<PaginatedResponse<User>> => {
  const { data } = await apiClient.get<PaginatedResponse<User>>('/users', {
    params: filters,
  });
  return data;
};

export const createUser = async (dto: CreateUserDto): Promise<User> => {
  const { data } = await apiClient.post<User>('/users', dto);
  return data;
};

export const deactivateUser = async (userId: string): Promise<User> => {
  const { data } = await apiClient.patch<User>(`/users/${userId}/deactivate`);
  return data;
};
