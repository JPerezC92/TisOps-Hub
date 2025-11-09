import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';

describe('GetTaskByIdUseCase', () => {
  let getTaskByIdUseCase: GetTaskByIdUseCase;
  let mockTaskRepository: ITaskRepository;

  beforeEach(() => {
    mockTaskRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

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

    vi.spyOn(mockTaskRepository, 'findById').mockResolvedValue(expectedTask);

    const result = await getTaskByIdUseCase.execute(1);

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(expectedTask);
  });

  it('should return null when task is not found', async () => {
    vi.spyOn(mockTaskRepository, 'findById').mockResolvedValue(null);

    const result = await getTaskByIdUseCase.execute(999);

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    vi.spyOn(mockTaskRepository, 'findById').mockRejectedValue(error);

    await expect(getTaskByIdUseCase.execute(1)).rejects.toThrow('Database error');
  });
});
