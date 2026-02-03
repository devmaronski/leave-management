import { z } from 'zod';
import { MIN_REASON_LENGTH, MAX_REASON_LENGTH } from '@/constants/leave.constants';

export const leaveRequestSchema = z
  .object({
    type: z.enum(['VL', 'SL', 'EL', 'UNPAID'], {
      message: 'Leave type is required',
    }),
    startDate: z.string({
      message: 'Start date is required',
    }).refine((date) => {
      // Allow past dates for editing, but generally prefer future dates
      return date !== '';
    }, {
      message: 'Start date is required',
    }),
    endDate: z.string({
      message: 'End date is required',
    }),
    reason: z
      .string({
        message: 'Reason is required',
      })
      .min(MIN_REASON_LENGTH, `Reason must be at least ${MIN_REASON_LENGTH} characters`)
      .max(MAX_REASON_LENGTH, `Reason must not exceed ${MAX_REASON_LENGTH} characters`),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
