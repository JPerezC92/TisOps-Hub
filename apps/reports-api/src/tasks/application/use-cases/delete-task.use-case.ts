import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { TaskNotFoundError } from '@tasks/domain/errors/task-not-found.error';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: number): Promise<void | TaskNotFoundError> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      return new TaskNotFoundError(id);
    }
    await this.taskRepository.delete(id);
  }
}
