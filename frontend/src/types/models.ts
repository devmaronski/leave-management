export type UserRole = 'EMPLOYEE' | 'HR' | 'ADMIN';

export type LeaveType = 'VL' | 'SL' | 'EL' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  decisionById?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  decisionBy?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
