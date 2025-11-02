import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: number): Promise<void> {
    return this.taskRepository.delete(id);
  }
}
