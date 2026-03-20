import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import type { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';
import { TaskNotFoundError } from '@tasks/domain/errors/task-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';

describe('UpdateTaskUseCase', () => {
  let updateTaskUseCase: UpdateTaskUseCase;
  let mockTaskRepository: MockProxy<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = mock<ITaskRepository>();
    updateTaskUseCase = new UpdateTaskUseCase(mockTaskRepository);
  });

  it('should update a task with new data', async () => {
    const existingTask = new Task(1, 'Old Task', 'Old Description', 'medium', false, new Date(), new Date());
    const updateData = {
      title: 'Updated Task',
      description: 'Updated Description',
      priority: 'high' as const,
    };
    const updatedTask = new Task(1, 'Updated Task', 'Updated Description', 'high', false, new Date(), new Date());

    mockTaskRepository.findById.mockResolvedValue(existingTask);
    mockTaskRepository.update.mockResolvedValue(updatedTask);

    const result = await updateTaskUseCase.execute(1, updateData);

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
    expect(mockTaskRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toBe(updatedTask);
  });

  it('should update only the title', async () => {
    const existingTask = new Task(1, 'Original Title', 'Original Description', 'medium', false, new Date(), new Date());
    const updateData = { title: 'New Title' };
    const updatedTask = new Task(1, 'New Title', 'Original Description', 'medium', false, new Date(), new Date());

    mockTaskRepository.findById.mockResolvedValue(existingTask);
    mockTaskRepository.update.mockResolvedValue(updatedTask);

    const result = await updateTaskUseCase.execute(1, updateData);

    expect(mockTaskRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.title).toBe('New Title');
  });

  it('should return TaskNotFoundError when task is not found', async () => {
    mockTaskRepository.findById.mockResolvedValue(null);

    const result = await updateTaskUseCase.execute(999, { title: 'Test' });

    expect(mockTaskRepository.findById).toHaveBeenCalledWith(999);
    expect(mockTaskRepository.update).not.toHaveBeenCalled();
    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(TaskNotFoundError);
    expect((result as TaskNotFoundError).message).toBe('Task with ID 999 not found');
  });

  it('should handle repository errors', async () => {
    const existingTask = new Task(1, 'Task', 'Description', 'medium', false, new Date(), new Date());
    mockTaskRepository.findById.mockResolvedValue(existingTask);
    mockTaskRepository.update.mockRejectedValue(new Error('Update failed'));

    await expect(updateTaskUseCase.execute(1, { title: 'Test' })).rejects.toThrow('Update failed');
  });
});
