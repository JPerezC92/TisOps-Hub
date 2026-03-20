import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';
import { TaskNotFoundError } from '@tasks/domain/errors/task-not-found.error';

export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: number): Promise<Task | TaskNotFoundError> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      return new TaskNotFoundError(id);
    }
    return task;
  }
}
