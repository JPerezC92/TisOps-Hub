import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import type { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';

describe('GetTaskByIdUseCase', () => {
  let getTaskByIdUseCase: GetTaskByIdUseCase;
  let mockTaskRepository: MockProxy<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = mock<ITaskRepository>();
    getTaskByIdUseCase = new GetTaskByIdUseCase(mockTaskRepository);
  });

  it('should return a task when found', async () => {
    const expectedTask = new Task(
      1,
      'Test Task',
      'Description',
      'high',
      false,
      new Date(),
      new Date(),
    );

    mockTaskRepository.findById.mockResolvedValue(expectedTask);

    const result = await getTaskByIdUseCase.execute(1);

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(expectedTask);
  });

  it('should return null when task is not found', async () => {
    mockTaskRepository.findById.mockResolvedValue(null);

    const result = await getTaskByIdUseCase.execute(999);

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockTaskRepository.findById.mockRejectedValue(error);

    await expect(getTaskByIdUseCase.execute(1)).rejects.toThrow('Database error');
  });
});
