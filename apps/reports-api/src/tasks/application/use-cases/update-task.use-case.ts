import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: number, data: Partial<Task>): Promise<Task> {
    return this.taskRepository.update(id, data);
  }
}
