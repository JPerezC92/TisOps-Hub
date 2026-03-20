import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';
import type { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';
import { TaskNotFoundError } from '@tasks/domain/errors/task-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';

describe('DeleteTaskUseCase', () => {
  let deleteTaskUseCase: DeleteTaskUseCase;
  let mockTaskRepository: MockProxy<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = mock<ITaskRepository>();
    deleteTaskUseCase = new DeleteTaskUseCase(mockTaskRepository);
  });

  it('should delete a task by id', async () => {
    const existingTask = new Task(1, 'Task', 'Description', 'medium', false, new Date(), new Date());
    mockTaskRepository.findById.mockResolvedValue(existingTask);
    mockTaskRepository.delete.mockResolvedValue(undefined);

    const result = await deleteTaskUseCase.execute(1);

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
    expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toBeUndefined();
  });

  it('should return TaskNotFoundError when task is not found', async () => {
    mockTaskRepository.findById.mockResolvedValue(null);

    const result = await deleteTaskUseCase.execute(999);

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(999);
    expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(TaskNotFoundError);
    expect((result as TaskNotFoundError).message).toBe('Task with ID 999 not found');
  });

  it('should handle repository errors', async () => {
    const existingTask = new Task(1, 'Task', 'Description', 'medium', false, new Date(), new Date());
    mockTaskRepository.findById.mockResolvedValue(existingTask);
    mockTaskRepository.delete.mockRejectedValue(new Error('Delete failed'));

    await expect(deleteTaskUseCase.execute(1)).rejects.toThrow('Delete failed');
  });
});
