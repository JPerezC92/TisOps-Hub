import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllMonthlyReportsUseCase } from '@monthly-report/application/use-cases/get-all-monthly-reports.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetAllMonthlyReportsUseCase', () => {
  let getAllMonthlyReportsUseCase: GetAllMonthlyReportsUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    getAllMonthlyReportsUseCase = new GetAllMonthlyReportsUseCase(mockRepository);
  });

  it('should return all monthly reports', async () => {
    const expectedReports = MonthlyReportFactory.createManyMonthlyReports(3);

    mockRepository.findAll.mockResolvedValue(expectedReports);
    mockRepository.countAll.mockResolvedValue(3);

    const result = await getAllMonthlyReportsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(mockRepository.countAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: expectedReports, total: 3 });
  });

  it('should return empty array when no reports exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);
    mockRepository.countAll.mockResolvedValue(0);

    const result = await getAllMonthlyReportsUseCase.execute();

    expect(result).toEqual({ data: [], total: 0 });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(getAllMonthlyReportsUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should call findAll and countAll in parallel', async () => {
    const expectedReports = MonthlyReportFactory.createManyMonthlyReports(2);

    mockRepository.findAll.mockResolvedValue(expectedReports);
    mockRepository.countAll.mockResolvedValue(2);

    await getAllMonthlyReportsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(mockRepository.countAll).toHaveBeenCalled();
  });
});
