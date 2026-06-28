'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../lib/db';

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

export async function createTask(title: string, description?: string) {
  try {
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }
    await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
      },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

export async function toggleTask(id: string, completed: boolean) {
  try {
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
