import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GetMonthlyReportStatusByIdUseCase } from '@monthly-report-status-registry/application/use-cases/get-monthly-report-status-by-id.use-case';
import { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('GetMonthlyReportStatusByIdUseCase', () => {
  let useCase: GetMonthlyReportStatusByIdUseCase;
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

    useCase = new GetMonthlyReportStatusByIdUseCase(mockRepository);
  });

  it('should return status mapping when found', async () => {
    const expectedStatus = MonthlyReportStatusFactory.create({ id: 1 });

    vi.spyOn(mockRepository, 'findById').mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedStatus);
  });

  it('should throw NotFoundException when status mapping not found', async () => {
    vi.spyOn(mockRepository, 'findById').mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(999)).rejects.toThrow('Monthly report status with ID 999 not found');

    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
