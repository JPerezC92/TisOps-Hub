import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteAllRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/delete-all-request-categorizations.use-case';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';

describe('DeleteAllRequestCategorizationsUseCase', () => {
  let deleteAllUseCase: DeleteAllRequestCategorizationsUseCase;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestCategorizationRepository>();
    deleteAllUseCase = new DeleteAllRequestCategorizationsUseCase(
      mockRepository,
    );
  });

  it('should delete all request categorizations', async () => {
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
