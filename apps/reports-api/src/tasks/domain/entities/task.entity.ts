export class Task {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly priority: 'low' | 'medium' | 'high',
    public readonly completed: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'medium',
      completed: false,
    } as any;
  }

  markAsCompleted(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.priority,
      true,
      this.createdAt,
      new Date(),
    );
  }

  updatePriority(priority: 'low' | 'medium' | 'high'): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      priority,
      this.completed,
      this.createdAt,
      new Date(),
    );
  }
}
