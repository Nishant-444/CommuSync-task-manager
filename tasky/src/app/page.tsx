import { getTasks } from './actions';
import TaskDashboard from './TaskDashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialTasks = await getTasks();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <TaskDashboard initialTasks={initialTasks} />
    </main>
  );
}
