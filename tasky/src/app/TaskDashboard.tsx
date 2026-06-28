'use client';

import React, { useState, useTransition, useActionState } from 'react';
import { createTask, toggleTask, deleteTask } from './actions';

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskDashboardProps {
  initialTasks: Task[];
}

type FilterType = 'all' | 'pending' | 'completed';

export default function TaskDashboard({ initialTasks }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Initial state for form validation
  const initialState = {
    success: false,
    errors: {} as Record<string, string>,
    values: { title: '', description: '' },
  };

  // Form submission handler using useActionState (React 19)
  const [formState, formAction, isFormSubmitting] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await createTask(prevState, formData);
      if (res.success) {
        // Refresh the local task list (we can fetch again or manually add it since we know the parameters)
        // Since we are using Server cache revalidation, we should refetch tasks or append optimistically.
        // Let's refetch or update state by getting current tasks from action or re-rendering page.
        // In full Next.js, window.location.reload() or router.refresh() is easy.
        // To keep it smooth and instant, we can reload pages.
        window.location.reload();
      }
      return res;
    },
    initialState
  );

  // Toggle completion
  const handleToggle = (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t))
    );

    startTransition(async () => {
      const res = await toggleTask(id, !currentStatus);
      if (!res.success) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: currentStatus } : t))
        );
        alert(res.error || 'Failed to update task.');
      }
    });
  };

  // Delete task
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    // Optimistic UI update
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    startTransition(async () => {
      const res = await deleteTask(id);
      if (!res.success) {
        setTasks(originalTasks);
        alert(res.error || 'Failed to delete task.');
      }
    });
  };

  // Filter and search logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col font-sans">
      {/* Header */}
      <header className="mb-12 border-b border-border pb-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight font-mono">tasky.</h1>
            {isPending && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted animate-pulse border border-border px-1.5 py-0.5 rounded-sm">
                syncing...
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1 font-mono">a bare-minimum task manager</p>
        </div>
        <div className="text-xs font-mono text-muted bg-surface border border-border px-3 py-1.5 rounded-sm self-start">
          {pendingCount} pending / {completedCount} completed
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Form Container (Col 1-5) */}
        <section className="md:col-span-5 border border-border p-6 rounded-sm bg-surface">
          <h2 className="text-lg font-bold font-mono mb-4 border-b border-border pb-2">New Task</h2>
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-mono text-muted uppercase mb-1">
                Title <span className="text-foreground">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={formState.values?.title || ''}
                placeholder="Buy milk..."
                className="w-full text-sm font-sans bg-background border border-border px-3 py-2 outline-none focus:border-foreground transition-colors rounded-sm text-foreground"
                disabled={isFormSubmitting}
              />
              {formState.errors?.title && (
                <p className="text-xs font-mono mt-1 text-foreground border-l-2 border-foreground pl-2 bg-neutral-100 dark:bg-neutral-900 py-0.5">
                  {formState.errors.title}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-mono text-muted uppercase mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={formState.values?.description || ''}
                placeholder="Pick up semi-skimmed milk..."
                className="w-full text-sm font-sans bg-background border border-border px-3 py-2 outline-none focus:border-foreground transition-colors rounded-sm text-foreground resize-none"
                disabled={isFormSubmitting}
              />
              {formState.errors?.description && (
                <p className="text-xs font-mono mt-1 text-foreground border-l-2 border-foreground pl-2 bg-neutral-100 dark:bg-neutral-900 py-0.5">
                  {formState.errors.description}
                </p>
              )}
            </div>

            {formState.error && (
              <p className="text-xs font-mono text-foreground border border-foreground bg-neutral-100 dark:bg-neutral-900 p-2">
                {formState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isFormSubmitting}
              className="w-full bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider py-2.5 px-4 transition-all hover:bg-muted active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isFormSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </section>

        {/* Task List Container (Col 6-12) */}
        <section className="md:col-span-7 flex flex-col gap-6">
          {/* Controls: Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-mono bg-surface border border-border px-3 py-2 outline-none focus:border-foreground transition-colors rounded-sm text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted hover:text-foreground cursor-pointer"
                >
                  [esc]
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 border border-border p-1 bg-surface rounded-sm self-start">
              {(['all', 'pending', 'completed'] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-sm transition-all cursor-pointer ${
                    filter === t
                      ? 'bg-foreground text-background'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* List content */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="border border-dashed border-border py-12 px-4 text-center rounded-sm">
                <p className="text-sm text-muted font-mono">
                  {searchQuery ? 'No matching tasks found.' : 'All clear. No tasks.'}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <article
                  key={task.id}
                  className={`group border border-border p-4 rounded-sm bg-surface transition-all flex items-start gap-4 hover:border-muted ${
                    task.completed ? 'opacity-60 bg-neutral-50 dark:bg-neutral-950/20' : ''
                  }`}
                >
                  {/* Custom minimalistic checkbox button */}
                  <button
                    onClick={() => handleToggle(task.id, task.completed)}
                    className="mt-1 flex-shrink-0 w-4 h-4 border border-foreground flex items-center justify-center cursor-pointer bg-background"
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                  >
                    {task.completed && (
                      <span className="w-2.5 h-2.5 bg-foreground block" />
                    )}
                  </button>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-bold leading-tight break-words text-foreground transition-all ${
                        task.completed ? 'line-through decoration-1.5' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-muted mt-1 leading-relaxed break-words whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2.5 flex items-center gap-3 text-[10px] font-mono text-muted">
                      <span suppressHydrationWarning>
                        {new Date(task.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Delete button (only visible on hover for cleaner UI, or always on mobile) */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-xs font-mono text-muted hover:text-foreground opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider cursor-pointer"
                  >
                    [Delete]
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-border pt-8 text-[10px] font-mono text-muted flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>tasky. created for assessment</div>
        <div className="flex gap-4">
          <span>no-auth</span>
          <span>&middot;</span>
          <span>prisma 7</span>
          <span>&middot;</span>
          <span>neon db</span>
        </div>
      </footer>
    </div>
  );
}
