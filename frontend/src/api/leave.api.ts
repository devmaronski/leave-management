import apiClient from './axios';
import type {
  LeaveRequest,
  PaginatedResponse,
  LeaveStatus,
} from '../types/models';

export interface CreateLeaveDto {
  type: 'VL' | 'SL' | 'EL' | 'UNPAID';
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  reason: string;
}

export interface UpdateLeaveDto {
  type?: 'VL' | 'SL' | 'EL' | 'UNPAID';
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface LeaveFilterDto {
  status?: LeaveStatus;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export const createLeaveRequest = async (
  dto: CreateLeaveDto
): Promise<LeaveRequest> => {
  const { data } = await apiClient.post<LeaveRequest>('/leave-requests', dto);
  return data;
};

export const getMyLeaveRequests = async (
  filters?: LeaveFilterDto
): Promise<PaginatedResponse<LeaveRequest>> => {
  const { data } = await apiClient.get<PaginatedResponse<LeaveRequest>>(
    '/leave-requests/mine',
    { params: filters }
  );
  return data;
};

export const updateLeaveRequest = async (
  id: string,
  dto: UpdateLeaveDto
): Promise<LeaveRequest> => {
  const { data } = await apiClient.patch<LeaveRequest>(
    `/leave-requests/${id}`,
    dto
  );
  return data;
};

export const cancelLeaveRequest = async (id: string): Promise<LeaveRequest> => {
  const { data } = await apiClient.post<LeaveRequest>(
    `/leave-requests/${id}/cancel`
  );
  return data;
};
