import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAllMonthlyReportStatusesUseCase } from '@monthly-report-status-registry/application/use-cases/get-all-monthly-report-statuses.use-case';
import { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('GetAllMonthlyReportStatusesUseCase', () => {
  let useCase: GetAllMonthlyReportStatusesUseCase;
  let mockRepository: IMonthlyReportStatusRegistryRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByRawStatus: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new GetAllMonthlyReportStatusesUseCase(mockRepository);
  });

  it('should return all active status mappings', async () => {
    const expectedStatuses = MonthlyReportStatusFactory.createMany(3);

    vi.spyOn(mockRepository, 'findAll').mockResolvedValue(expectedStatuses);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedStatuses);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no status mappings exist', async () => {
    vi.spyOn(mockRepository, 'findAll').mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
