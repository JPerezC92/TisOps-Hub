'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@repo/reports';
import styles from './page.module.css';

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
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tasks Manager</h1>

      <form onSubmit={handleCreate} className={styles.form}>
        <h2>Create New Task</h2>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.input}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>
          Add Task
        </button>
      </form>

      <div className={styles.taskList}>
        <h2>Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className={styles.emptyMessage}>No tasks yet. Create one above!</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={styles.taskCard}>
              <div className={styles.taskHeader}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => handleUpdate(task.id, e.target.checked)}
                  className={styles.checkbox}
                />
                <h3 className={task.completed ? styles.completed : ''}>
                  {task.title}
                </h3>
              </div>
              {task.description && (
                <p className={styles.description}>{task.description}</p>
              )}
              <div className={styles.taskFooter}>
                <span className={styles.date}>
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className={styles.deleteButton}
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
