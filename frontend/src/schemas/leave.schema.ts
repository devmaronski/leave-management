import { z } from 'zod';

export const leaveRequestSchema = z
  .object({
    type: z.enum(['VL', 'SL', 'EL', 'UNPAID'], {
      required_error: 'Leave type is required',
    }),
    startDate: z.string({
      required_error: 'Start date is required',
    }),
    endDate: z.string({
      required_error: 'End date is required',
    }),
    reason: z
      .string({
        required_error: 'Reason is required',
      })
      .min(3, 'Reason must be at least 3 characters')
      .max(500, 'Reason must not exceed 500 characters'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
