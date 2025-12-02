'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@repo/reports/frontend';
import { Badge } from '@/components/ui/badge';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3000/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create task
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, completed: false }),
      });
      if (response.ok) {
        setTitle('');
        setDescription('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Update task
  const handleUpdate = async (id: number, completed: boolean) => {
    try {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE',
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-foreground">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4">Loading tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Tasks Manager</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Manage your tasks and track your progress
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">Total Tasks</div>
            <div className="text-4xl font-bold text-jpc-vibrant-cyan-400">{tasks.length}</div>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">Completed</div>
            <div className="text-4xl font-bold text-jpc-vibrant-emerald-400">{completedCount}</div>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">Pending</div>
            <div className="text-4xl font-bold text-jpc-vibrant-orange-400">{pendingCount}</div>
          </div>
        </div>

        {/* Create Task Form */}
        <form onSubmit={handleCreate} className="bg-card border border-border/60 rounded-xl p-6 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Create New Task</h2>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 mb-4 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y"
          />
          <button
            type="submit"
            className="bg-jpc-vibrant-cyan-500/20 text-cyan-100 border border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30 px-6 py-3 rounded-lg font-medium transition-all duration-300"
          >
            Add Task
          </button>
        </form>

        {/* Tasks List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Tasks</h2>
            <Badge variant="outline" className="bg-jpc-vibrant-cyan-500/20 text-cyan-100 border-jpc-vibrant-cyan-500/40 font-medium">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </Badge>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-foreground text-lg mb-2 mt-4">No tasks yet</p>
              <p className="text-muted-foreground/70 text-sm">Create your first task above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-card border border-border/60 rounded-xl p-6 shadow-xl hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => handleUpdate(task.id, e.target.checked)}
                      className="w-5 h-5 mt-1 cursor-pointer accent-jpc-vibrant-cyan-500"
                    />
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`mb-4 leading-relaxed ${task.completed ? 'text-muted-foreground/50' : 'text-muted-foreground/80'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-border/60">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground/70">
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                          {task.completed ? (
                            <Badge variant="outline" className="bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="bg-red-500/20 text-red-100 border border-red-500/40 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
