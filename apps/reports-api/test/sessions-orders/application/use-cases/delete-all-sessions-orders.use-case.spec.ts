import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/delete-all-sessions-orders.use-case';
import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';

describe('DeleteAllSessionsOrdersUseCase', () => {
  let deleteAllSessionsOrdersUseCase: DeleteAllSessionsOrdersUseCase;
  let mockRepository: MockProxy<ISessionsOrdersRepository>;

  beforeEach(() => {
    mockRepository = mock<ISessionsOrdersRepository>();
    deleteAllSessionsOrdersUseCase = new DeleteAllSessionsOrdersUseCase(mockRepository);
  });

  it('should delete all sessions orders and releases', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(100);
    mockRepository.deleteAllReleases.mockResolvedValue(50);

    const result = await deleteAllSessionsOrdersUseCase.execute();

    expect(mockRepository.deleteAllMain).toHaveBeenCalledOnce();
    expect(mockRepository.deleteAllReleases).toHaveBeenCalledOnce();
    expect(result).toEqual({
      message: 'All sessions/orders records deleted successfully',
      deletedMain: 100,
      deletedReleases: 50,
    });
  });

  it('should return zero when no records to delete', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(0);
    mockRepository.deleteAllReleases.mockResolvedValue(0);

    const result = await deleteAllSessionsOrdersUseCase.execute();

    expect(result.deletedMain).toBe(0);
    expect(result.deletedReleases).toBe(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.deleteAllMain.mockRejectedValue(error);

    await expect(deleteAllSessionsOrdersUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should call both delete methods in parallel', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(50);
    mockRepository.deleteAllReleases.mockResolvedValue(25);

    await deleteAllSessionsOrdersUseCase.execute();

    expect(mockRepository.deleteAllMain).toHaveBeenCalled();
    expect(mockRepository.deleteAllReleases).toHaveBeenCalled();
  });
});
