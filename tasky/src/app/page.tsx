import { Task } from '@/generated/prisma/client';
import { getTasks } from './actions';
import TaskDashboard from './TaskDashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let initialTasks: Task[] = [];

  try {
    initialTasks = await getTasks();

    // Guard against undefined or null returns from the action
    if (!initialTasks) {
      console.warn('getTasks returned null or undefined');
      initialTasks = [];
    }
  } catch (error) {
    // This logs the ACTUAL error to your Vercel dashboard
    console.error('Failed to execute getTasks in Home component:', error);

    // Note: Next.js 'notFound()' throws a specific error. 
    // If you want to allow notFound() to still trigger a 404, you must rethrow it.
    // Otherwise, we swallow the error and pass an empty array to keep the UI alive.
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <TaskDashboard initialTasks={initialTasks} />
    </main>
  );
}