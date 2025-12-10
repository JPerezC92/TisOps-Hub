import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllMonthlyReportStatusesUseCase } from '@monthly-report-status-registry/application/use-cases/get-all-monthly-report-statuses.use-case';
import type { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('GetAllMonthlyReportStatusesUseCase', () => {
  let useCase: GetAllMonthlyReportStatusesUseCase;
  let mockRepository: MockProxy<IMonthlyReportStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportStatusRegistryRepository>();
    useCase = new GetAllMonthlyReportStatusesUseCase(mockRepository);
  });

  it('should return all active status mappings', async () => {
    const expectedStatuses = MonthlyReportStatusFactory.createMany(3);

    mockRepository.findAll.mockResolvedValue(expectedStatuses);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedStatuses);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no status mappings exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
