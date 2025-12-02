import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/create-monthly-report-status.use-case';
import { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusFactory } from '../../helpers/monthly-report-status.factory';

describe('CreateMonthlyReportStatusUseCase', () => {
  let useCase: CreateMonthlyReportStatusUseCase;
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

    useCase = new CreateMonthlyReportStatusUseCase(mockRepository);
  });

  it('should create status mapping with all fields', async () => {
    const statusData = {
      rawStatus: 'Pendiente',
      displayStatus: 'In L3 Backlog',
      isActive: true,
    };

    const expectedStatus = MonthlyReportStatusFactory.create({
      id: 1,
      rawStatus: 'Pendiente',
      displayStatus: 'In L3 Backlog',
      isActive: true,
    });

    vi.spyOn(mockRepository, 'create').mockResolvedValue(expectedStatus);

    const result = await useCase.execute(statusData);

    expect(mockRepository.create).toHaveBeenCalledWith(statusData);
    expect(result).toEqual(expectedStatus);
  });

  it('should create status mapping with minimal fields (isActive defaults to true)', async () => {
    const statusData = {
      rawStatus: 'En Progreso',
      displayStatus: 'In Progress',
    };

    const expectedStatus = MonthlyReportStatusFactory.create({
      id: 1,
      rawStatus: 'En Progreso',
      displayStatus: 'In Progress',
      isActive: true,
    });

    vi.spyOn(mockRepository, 'create').mockResolvedValue(expectedStatus);

    const result = await useCase.execute(statusData);

    expect(mockRepository.create).toHaveBeenCalledWith(statusData);
    expect(result).toEqual(expectedStatus);
  });
});
