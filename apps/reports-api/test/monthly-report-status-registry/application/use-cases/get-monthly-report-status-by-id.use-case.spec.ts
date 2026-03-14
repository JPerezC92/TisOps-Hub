import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetMonthlyReportStatusByIdUseCase } from '@monthly-report-status-registry/application/use-cases/get-monthly-report-status-by-id.use-case';
import type { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusNotFoundError } from '@monthly-report-status-registry/domain/errors/monthly-report-status-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('GetMonthlyReportStatusByIdUseCase', () => {
  let useCase: GetMonthlyReportStatusByIdUseCase;
  let mockRepository: MockProxy<IMonthlyReportStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportStatusRegistryRepository>();
    useCase = new GetMonthlyReportStatusByIdUseCase(mockRepository);
  });

  it('should return status mapping when found', async () => {
    const expectedStatus = MonthlyReportStatusFactory.create({ id: 1 });

    mockRepository.findById.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedStatus);
  });

  it('should return MonthlyReportStatusNotFoundError when status mapping not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(MonthlyReportStatusNotFoundError);
    expect((result as MonthlyReportStatusNotFoundError).message).toBe('Monthly report status with ID 999 not found');
    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
