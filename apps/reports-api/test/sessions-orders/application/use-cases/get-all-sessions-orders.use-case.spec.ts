import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/get-all-sessions-orders.use-case';
import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import { SessionsOrdersFactory } from '../../helpers/sessions-orders.factory';

describe('GetAllSessionsOrdersUseCase', () => {
  let getAllSessionsOrdersUseCase: GetAllSessionsOrdersUseCase;
  let mockRepository: MockProxy<ISessionsOrdersRepository>;

  beforeEach(() => {
    mockRepository = mock<ISessionsOrdersRepository>();
    getAllSessionsOrdersUseCase = new GetAllSessionsOrdersUseCase(mockRepository);
  });

  it('should return all sessions orders and releases', async () => {
    const expectedMain = SessionsOrdersFactory.createManySessionsOrders(3);
    const expectedReleases = SessionsOrdersFactory.createManyReleases(2);

    mockRepository.findAllMain.mockResolvedValue(expectedMain);
    mockRepository.findAllReleases.mockResolvedValue(expectedReleases);
    mockRepository.countMain.mockResolvedValue(3);
    mockRepository.countReleases.mockResolvedValue(2);

    const result = await getAllSessionsOrdersUseCase.execute();

    expect(mockRepository.findAllMain).toHaveBeenCalledOnce();
    expect(mockRepository.findAllReleases).toHaveBeenCalledOnce();
    expect(mockRepository.countMain).toHaveBeenCalledOnce();
    expect(mockRepository.countReleases).toHaveBeenCalledOnce();
    expect(result).toEqual({
      data: expectedMain,
      releases: expectedReleases,
      total: 3,
      totalReleases: 2,
    });
  });

  it('should return empty arrays when no records exist', async () => {
    mockRepository.findAllMain.mockResolvedValue([]);
    mockRepository.findAllReleases.mockResolvedValue([]);
    mockRepository.countMain.mockResolvedValue(0);
    mockRepository.countReleases.mockResolvedValue(0);

    const result = await getAllSessionsOrdersUseCase.execute();

    expect(result).toEqual({
      data: [],
      releases: [],
      total: 0,
      totalReleases: 0,
    });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAllMain.mockRejectedValue(error);

    await expect(getAllSessionsOrdersUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should call all repository methods in parallel', async () => {
    const expectedMain = SessionsOrdersFactory.createManySessionsOrders(2);
    const expectedReleases = SessionsOrdersFactory.createManyReleases(1);

    mockRepository.findAllMain.mockResolvedValue(expectedMain);
    mockRepository.findAllReleases.mockResolvedValue(expectedReleases);
    mockRepository.countMain.mockResolvedValue(2);
    mockRepository.countReleases.mockResolvedValue(1);

    await getAllSessionsOrdersUseCase.execute();

    expect(mockRepository.findAllMain).toHaveBeenCalled();
    expect(mockRepository.findAllReleases).toHaveBeenCalled();
    expect(mockRepository.countMain).toHaveBeenCalled();
    expect(mockRepository.countReleases).toHaveBeenCalled();
  });
});
