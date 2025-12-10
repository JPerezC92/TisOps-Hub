import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import type { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';

describe('GetAllTasksUseCase', () => {
  let getAllTasksUseCase: GetAllTasksUseCase;
  let mockTaskRepository: MockProxy<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = mock<ITaskRepository>();
    getAllTasksUseCase = new GetAllTasksUseCase(mockTaskRepository);
  });

  it('should return all tasks', async () => {
    const expectedTasks = [
      new Task(1, 'Task 1', 'Description 1', 'high', false, new Date(), new Date()),
      new Task(2, 'Task 2', 'Description 2', 'medium', true, new Date(), new Date()),
      new Task(3, 'Task 3', null, 'low', false, new Date(), new Date()),
    ];

    mockTaskRepository.findAll.mockResolvedValue(expectedTasks);

    const result = await getAllTasksUseCase.execute();

    expect(mockTaskRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toBe(expectedTasks);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no tasks exist', async () => {
    mockTaskRepository.findAll.mockResolvedValue([]);

    const result = await getAllTasksUseCase.execute();

    expect(mockTaskRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database connection failed');
    mockTaskRepository.findAll.mockRejectedValue(error);

    await expect(getAllTasksUseCase.execute()).rejects.toThrow('Database connection failed');
  });
});
