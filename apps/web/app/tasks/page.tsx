'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@repo/reports';

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

  if (loading) {
    return <div className="max-w-[800px] mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto p-8">
      <h1 className="text-4xl mb-8 text-gray-800">Tasks Manager</h1>

      <form onSubmit={handleCreate} className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-2xl mb-4 text-gray-600">Create New Task</h2>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded text-base font-[inherit]"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded text-base font-[inherit] min-h-[100px] resize-y"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 border-none rounded text-base cursor-pointer transition-colors hover:bg-blue-700">
          Add Task
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-2xl mb-4 text-gray-600">Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-center text-gray-400 p-8 italic">No tasks yet. Create one above!</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => handleUpdate(task.id, e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <h3 className={`m-0 text-xl text-gray-800 flex-1 ${task.completed ? 'line-through !text-gray-400' : ''}`}>
                  {task.title}
                </h3>
              </div>
              {task.description && (
                <p className="my-2 ml-8 text-gray-600 leading-relaxed">{task.description}</p>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-400">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-red-600 text-white px-4 py-2 border-none rounded text-sm cursor-pointer transition-colors hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
