import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';
import { TaskNotFoundError } from '@tasks/domain/errors/task-not-found.error';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: number, data: Partial<Task>): Promise<Task | TaskNotFoundError> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      return new TaskNotFoundError(id);
    }
    return this.taskRepository.update(id, data);
  }
}
