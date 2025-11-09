import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';

describe('UpdateTaskUseCase', () => {
  let updateTaskUseCase: UpdateTaskUseCase;
  let mockTaskRepository: ITaskRepository;

  beforeEach(() => {
    mockTaskRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    updateTaskUseCase = new UpdateTaskUseCase(mockTaskRepository);
  });

  it('should update a task with new data', async () => {
    const updateData = {
      title: 'Updated Task',
      description: 'Updated Description',
      priority: 'high' as const,
    };

    const updatedTask = new Task(
      1,
      'Updated Task',
      'Updated Description',
      'high',
      false,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'update').mockResolvedValue(updatedTask);

    const result = await updateTaskUseCase.execute(1, updateData);

    expect(mockTaskRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toBe(updatedTask);
  });

  it('should update only the title', async () => {
    const updateData = {
      title: 'New Title',
    };

    const updatedTask = new Task(
      1,
      'New Title',
      'Original Description',
      'medium',
      false,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'update').mockResolvedValue(updatedTask);

    const result = await updateTaskUseCase.execute(1, updateData);

    expect(mockTaskRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.title).toBe('New Title');
  });

  it('should update task completion status', async () => {
    const updateData = {
      completed: true,
    };

    const updatedTask = new Task(
      1,
      'Task',
      'Description',
      'medium',
      true,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'update').mockResolvedValue(updatedTask);

    const result = await updateTaskUseCase.execute(1, updateData);

    expect(mockTaskRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.completed).toBe(true);
  });

  it('should update task priority', async () => {
    const updateData = {
      priority: 'low' as const,
    };

    const updatedTask = new Task(
      1,
      'Task',
      'Description',
      'low',
      false,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'update').mockResolvedValue(updatedTask);

    const result = await updateTaskUseCase.execute(1, updateData);

    expect(mockTaskRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.priority).toBe('low');
  });

  it('should handle repository errors', async () => {
    const error = new Error('Update failed');
    vi.spyOn(mockTaskRepository, 'update').mockRejectedValue(error);

    await expect(updateTaskUseCase.execute(1, { title: 'Test' })).rejects.toThrow(
      'Update failed',
    );
  });
});
