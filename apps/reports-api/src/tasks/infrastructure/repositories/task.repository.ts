import { eq } from 'drizzle-orm';
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';
import { TaskAdapter } from '@tasks/infrastructure/adapters/task.adapter';
import { Database, tasks } from '@repo/database';

export class TaskRepository implements ITaskRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Task[]> {
    const result = await this.db.select().from(tasks);
    return result.map(TaskAdapter.toDomain);
  }

  async findById(id: number): Promise<Task | null> {
    const result = await this.db.select().from(tasks).where(eq(tasks.id, id));
    return result.length > 0 ? TaskAdapter.toDomain(result[0]) : null;
  }

  async create(taskData: Partial<Task>): Promise<Task> {
    const result = await this.db
      .insert(tasks)
      .values({
        title: taskData.title!,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        completed: taskData.completed || false,
      })
      .returning();
    return TaskAdapter.toDomain(result[0]);
  }

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const result = await this.db
      .update(tasks)
      .set({
        ...taskData,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();
    return TaskAdapter.toDomain(result[0]);
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }
}
