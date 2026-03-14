import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/update-monthly-report-status.use-case';
import type { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusNotFoundError } from '@monthly-report-status-registry/domain/errors/monthly-report-status-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
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

    const existingStatus = MonthlyReportStatusFactory.create({ id: 1 });
    const expectedStatus = MonthlyReportStatusFactory.create({
      id: 1,
      rawStatus: 'Updated Status',
      displayStatus: 'Updated Display',
      isActive: false,
    });

    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.update.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
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

    const existingStatus = MonthlyReportStatusFactory.create({ id: 1 });
    const expectedStatus = MonthlyReportStatusFactory.create({
      id: 1,
      displayStatus: 'New Display Status',
    });

    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.update.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.displayStatus).toBe('New Display Status');
  });

  it('should return MonthlyReportStatusNotFoundError when status not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999, { displayStatus: 'Updated' });

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(MonthlyReportStatusNotFoundError);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
