import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteAllRequestTagsUseCase } from '@request-tags/application/use-cases/delete-all-request-tags.use-case';
import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

describe('DeleteAllRequestTagsUseCase', () => {
  let deleteAllRequestTagsUseCase: DeleteAllRequestTagsUseCase;
  let mockRepository: MockProxy<IRequestTagRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestTagRepository>();
    deleteAllRequestTagsUseCase = new DeleteAllRequestTagsUseCase(mockRepository);
  });

  it('should delete all request tags and return count', async () => {
    mockRepository.count.mockResolvedValue(10);
    mockRepository.deleteAll.mockResolvedValue(undefined);

    const result = await deleteAllRequestTagsUseCase.execute();

    expect(mockRepository.count).toHaveBeenCalledOnce();
    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ deleted: 10 });
  });

  it('should return zero when no tags exist', async () => {
    mockRepository.count.mockResolvedValue(0);
    mockRepository.deleteAll.mockResolvedValue(undefined);

    const result = await deleteAllRequestTagsUseCase.execute();

    expect(mockRepository.count).toHaveBeenCalledOnce();
    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ deleted: 0 });
  });

  it('should handle repository errors during count', async () => {
    const error = new Error('Database error');
    mockRepository.count.mockRejectedValue(error);

    await expect(deleteAllRequestTagsUseCase.execute()).rejects.toThrow(
      'Database error',
    );

    expect(mockRepository.deleteAll).not.toHaveBeenCalled();
  });

  it('should handle repository errors during deletion', async () => {
    const error = new Error('Delete failed');
    mockRepository.count.mockResolvedValue(5);
    mockRepository.deleteAll.mockRejectedValue(error);

    await expect(deleteAllRequestTagsUseCase.execute()).rejects.toThrow(
      'Delete failed',
    );

    expect(mockRepository.count).toHaveBeenCalledOnce();
  });

  it('should delete large number of tags', async () => {
    mockRepository.count.mockResolvedValue(1000);
    mockRepository.deleteAll.mockResolvedValue(undefined);

    const result = await deleteAllRequestTagsUseCase.execute();

    expect(result).toEqual({ deleted: 1000 });
  });
});
