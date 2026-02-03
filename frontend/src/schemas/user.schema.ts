import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['EMPLOYEE', 'HR', 'ADMIN'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }).optional(),
});

export const userFilterSchema = z.object({
  role: z.enum(['EMPLOYEE', 'HR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UserFilterFormData = z.infer<typeof userFilterSchema>;
