import type { LeaveStatus, LeaveType } from '@/types/models';

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  VL: 'Vacation Leave',
  SL: 'Sick Leave',
  EL: 'Emergency Leave',
  UNPAID: 'Unpaid Leave',
} as const;

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
} as const;

export const LEAVE_STATUS_VARIANTS: Record<
  LeaveStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'default',
  APPROVED: 'secondary',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_REASON_LENGTH = 500;
export const MIN_REASON_LENGTH = 3;
