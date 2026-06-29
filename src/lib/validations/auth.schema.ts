import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
const passwordMessage = 'Password must contain at least one uppercase letter, one number, and one special character';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: 'Please provide a valid email address',
    }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(passwordRegex, { message: passwordMessage }),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .min(3, { message: 'Name must be at least 3 characters long' })
    .regex(/^[A-Za-z ]+$/, { message: 'Name can contain only letters and spaces' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: 'Please provide a valid email address',
    }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || (val.length === 10 && /^[6-9]\d{9}$/.test(val)), {
      message: 'Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits',
    }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(passwordRegex, { message: passwordMessage }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
