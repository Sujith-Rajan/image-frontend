import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' }),
  category: z
    .string()
    .min(1, { message: 'Category is required' }),
  priority: z
    .enum(['Low', 'Medium', 'High'])
    .refine((val) => !!val, {
      message: 'Priority is required',
    }),
  status: z
    .enum(['Pending', 'In Progress', 'Completed']),
  progress: z
    .number()
    .min(0, { message: 'Progress must be at least 0' })
    .max(100, { message: 'Progress cannot exceed 100' }),
  dueDate: z
    .string()
    .optional(),
  assignedTo: z
    .string()
    .optional(),
  subTasks: z
    .array(
      z.object({
        title: z.string().min(1, 'Subtask title is required'),
        isCompleted: z.boolean(),
      })
    )
    .optional(),
});

export type CreateTodoFormData = z.infer<typeof createTodoSchema>;
