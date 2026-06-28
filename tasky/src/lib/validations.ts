import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required and cannot be empty.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),
  description: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters.' })
    .optional()
    .or(z.literal('')),
});

export type TaskInput = z.infer<typeof taskSchema>;
