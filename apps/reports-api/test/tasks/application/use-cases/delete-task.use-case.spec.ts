import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';

describe('DeleteTaskUseCase', () => {
  let deleteTaskUseCase: DeleteTaskUseCase;
  let mockTaskRepository: ITaskRepository;

  beforeEach(() => {
    mockTaskRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    deleteTaskUseCase = new DeleteTaskUseCase(mockTaskRepository);
  });

  it('should delete a task by id', async () => {
    vi.spyOn(mockTaskRepository, 'delete').mockResolvedValue(undefined);

    await deleteTaskUseCase.execute(1);

    expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
    expect(mockTaskRepository.delete).toHaveBeenCalledOnce();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Delete failed');
    vi.spyOn(mockTaskRepository, 'delete').mockRejectedValue(error);

    await expect(deleteTaskUseCase.execute(1)).rejects.toThrow('Delete failed');
  });

  it('should return void on successful deletion', async () => {
    vi.spyOn(mockTaskRepository, 'delete').mockResolvedValue(undefined);

    const result = await deleteTaskUseCase.execute(1);

    expect(result).toBeUndefined();
  });
});
