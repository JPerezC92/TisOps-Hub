import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';
import type { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';

describe('DeleteTaskUseCase', () => {
  let deleteTaskUseCase: DeleteTaskUseCase;
  let mockTaskRepository: MockProxy<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = mock<ITaskRepository>();
    deleteTaskUseCase = new DeleteTaskUseCase(mockTaskRepository);
  });

  it('should delete a task by id', async () => {
    mockTaskRepository.delete.mockResolvedValue(undefined);

    await deleteTaskUseCase.execute(1);

    expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
    expect(mockTaskRepository.delete).toHaveBeenCalledOnce();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Delete failed');
    mockTaskRepository.delete.mockRejectedValue(error);

    await expect(deleteTaskUseCase.execute(1)).rejects.toThrow('Delete failed');
  });

  it('should return void on successful deletion', async () => {
    mockTaskRepository.delete.mockResolvedValue(undefined);

    const result = await deleteTaskUseCase.execute(1);

    expect(result).toBeUndefined();
  });
});
