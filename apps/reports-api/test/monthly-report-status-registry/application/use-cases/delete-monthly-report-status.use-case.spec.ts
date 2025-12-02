import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/delete-monthly-report-status.use-case';
import { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';

describe('DeleteMonthlyReportStatusUseCase', () => {
  let useCase: DeleteMonthlyReportStatusUseCase;
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

    useCase = new DeleteMonthlyReportStatusUseCase(mockRepository);
  });

  it('should soft delete status mapping successfully', async () => {
    vi.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledOnce();
  });

  it('should call repository delete with correct id', async () => {
    vi.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

    await useCase.execute(42);

    expect(mockRepository.delete).toHaveBeenCalledWith(42);
  });
});
