import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task> {
    const taskData = Task.create(data);
    return this.taskRepository.create(taskData);
  }
}
