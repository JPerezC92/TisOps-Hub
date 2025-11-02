import { Task } from '@tasks/domain/entities/task.entity';

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
  create(task: Partial<Task>): Promise<Task>;
  update(id: number, task: Partial<Task>): Promise<Task>;
  delete(id: number): Promise<void>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');
