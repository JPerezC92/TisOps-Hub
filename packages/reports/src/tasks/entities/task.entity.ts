// Task entity type (matches database schema)
export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export type TaskResponse = Task;
export type TaskListResponse = Task[];
