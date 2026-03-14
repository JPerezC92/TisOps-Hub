import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/delete-monthly-report-status.use-case';
import type { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusNotFoundError } from '@monthly-report-status-registry/domain/errors/monthly-report-status-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('DeleteMonthlyReportStatusUseCase', () => {
  let useCase: DeleteMonthlyReportStatusUseCase;
  let mockRepository: MockProxy<IMonthlyReportStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportStatusRegistryRepository>();
    useCase = new DeleteMonthlyReportStatusUseCase(mockRepository);
  });

  it('should soft delete status mapping successfully', async () => {
    const existingStatus = MonthlyReportStatusFactory.create({ id: 1 });
    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledOnce();
  });

  it('should call repository delete with correct id', async () => {
    const existingStatus = MonthlyReportStatusFactory.create({ id: 42 });
    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(42);

    expect(mockRepository.delete).toHaveBeenCalledWith(42);
  });

  it('should return MonthlyReportStatusNotFoundError when status not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(MonthlyReportStatusNotFoundError);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
