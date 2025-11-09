import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/delete-all.use-case';
import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';

describe('DeleteAllParentChildRequestsUseCase', () => {
  let deleteAllUseCase: DeleteAllParentChildRequestsUseCase;
  let mockRepository: MockProxy<IParentChildRequestRepository>;

  beforeEach(() => {
    mockRepository = mock<IParentChildRequestRepository>();
    deleteAllUseCase = new DeleteAllParentChildRequestsUseCase(mockRepository);
  });

  it('should delete all parent-child requests', async () => {
    mockRepository.deleteAll.mockResolvedValue(undefined);

    await deleteAllUseCase.execute();

    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
  });

  it('should return void on successful deletion', async () => {
    mockRepository.deleteAll.mockResolvedValue(undefined);

    const result = await deleteAllUseCase.execute();

    expect(result).toBeUndefined();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Delete failed');
    mockRepository.deleteAll.mockRejectedValue(error);

    await expect(deleteAllUseCase.execute()).rejects.toThrow('Delete failed');
  });
});
