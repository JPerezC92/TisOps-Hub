import { eq } from 'drizzle-orm';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { Database, tasks } from '@repo/database';

export class TaskRepository implements ITaskRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Task[]> {
    const result = await this.db.select().from(tasks);
    return result.map(this.toDomain);
  }

  async findById(id: number): Promise<Task | null> {
    const result = await this.db.select().from(tasks).where(eq(tasks.id, id));
    return result.length > 0 ? this.toDomain(result[0]) : null;
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
    return this.toDomain(result[0]);
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
    return this.toDomain(result[0]);
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }

  private toDomain(data: any): Task {
    return new Task(
      data.id,
      data.title,
      data.description,
      data.priority,
      data.completed,
      data.createdAt,
      data.updatedAt,
    );
  }
}
