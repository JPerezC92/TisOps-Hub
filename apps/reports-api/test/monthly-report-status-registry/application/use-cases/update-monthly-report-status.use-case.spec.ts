import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/update-monthly-report-status.use-case';
import type { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('UpdateMonthlyReportStatusUseCase', () => {
  let useCase: UpdateMonthlyReportStatusUseCase;
  let mockRepository: MockProxy<IMonthlyReportStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportStatusRegistryRepository>();
    useCase = new UpdateMonthlyReportStatusUseCase(mockRepository);
  });

  it('should update status mapping successfully', async () => {
    const updateData = {
      rawStatus: 'Updated Status',
      displayStatus: 'Updated Display',
      isActive: false,
    };

    const expectedStatus = MonthlyReportStatusFactory.create({
      id: 1,
      rawStatus: 'Updated Status',
      displayStatus: 'Updated Display',
      isActive: false,
    });

    mockRepository.update.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toEqual(expectedStatus);
    expect(result.rawStatus).toBe('Updated Status');
    expect(result.displayStatus).toBe('Updated Display');
    expect(result.isActive).toBe(false);
  });

  it('should update only provided fields (partial update)', async () => {
    const updateData = {
      displayStatus: 'New Display Status',
    };

    const expectedStatus = MonthlyReportStatusFactory.create({
      id: 1,
      displayStatus: 'New Display Status',
    });

    mockRepository.update.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.displayStatus).toBe('New Display Status');
  });
});
