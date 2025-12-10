import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { MapRawStatusUseCase } from '@monthly-report-status-registry/application/use-cases/map-raw-status.use-case';
import type { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('MapRawStatusUseCase', () => {
  let useCase: MapRawStatusUseCase;
  let mockRepository: MockProxy<IMonthlyReportStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportStatusRegistryRepository>();
    useCase = new MapRawStatusUseCase(mockRepository);
  });

  it('should return mapped displayStatus when raw status is found', async () => {
    const status = MonthlyReportStatusFactory.create({
      rawStatus: 'Pendiente',
      displayStatus: 'In L3 Backlog',
    });

    mockRepository.findByRawStatus.mockResolvedValue(status);

    const result = await useCase.execute('Pendiente');

    expect(mockRepository.findByRawStatus).toHaveBeenCalledWith('Pendiente');
    expect(result).toBe('In L3 Backlog');
  });

  it('should return "In L3 Backlog" as fallback when raw status is not found', async () => {
    mockRepository.findByRawStatus.mockResolvedValue(null);

    const result = await useCase.execute('Unknown Status');

    expect(mockRepository.findByRawStatus).toHaveBeenCalledWith('Unknown Status');
    expect(result).toBe('In L3 Backlog');
  });

  it('should handle different raw status values correctly', async () => {
    const resolvedStatus = MonthlyReportStatusFactory.create({
      rawStatus: 'Resuelto',
      displayStatus: 'Resolved',
    });

    mockRepository.findByRawStatus.mockResolvedValue(resolvedStatus);

    const result = await useCase.execute('Resuelto');

    expect(mockRepository.findByRawStatus).toHaveBeenCalledWith('Resuelto');
    expect(result).toBe('Resolved');
  });
});
