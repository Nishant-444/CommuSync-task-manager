'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../lib/db';
import { taskSchema } from '../lib/validations';

export async function getTasks() {
  try {
    return await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function createTask(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  const result = taskSchema.safeParse({ title, description });

  if (!result.success) {
    const flattenedErrors = result.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const key in flattenedErrors) {
      const fieldErrors = flattenedErrors[key as keyof typeof flattenedErrors];
      if (fieldErrors && fieldErrors.length > 0) {
        errors[key] = fieldErrors[0];
      }
    }
    return {
      success: false,
      errors,
      values: { title, description },
    };
  }

  try {
    await prisma.task.create({
      data: {
        title: result.data.title,
        description: result.data.description || null,
      },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return {
      success: false,
      error: error.message || 'Failed to create task. Please try again.',
      values: { title, description },
    };
  }
}

export async function toggleTask(id: string, completed: boolean) {
  try {
    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }
    await prisma.task.update({
      where: { id },
      data: { completed },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating task:', error);
    return { success: false, error: error.message || 'Failed to update task' };
  }
}

export async function deleteTask(id: string) {
  try {
    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }
    await prisma.task.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message || 'Failed to delete task' };
  }
}
