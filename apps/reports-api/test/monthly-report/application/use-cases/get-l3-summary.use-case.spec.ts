import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetL3SummaryUseCase } from '@monthly-report/application/use-cases/get-l3-summary.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetL3SummaryUseCase', () => {
  let useCase: GetL3SummaryUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetL3SummaryUseCase(mockRepository);
  });

  it('should return L3 summary without filters', async () => {
    const expectedResult = MonthlyReportFactory.createL3SummaryResult();

    mockRepository.findL3Summary.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findL3Summary).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('totals');
  });

  it('should return L3 summary filtered by app', async () => {
    const expectedResult = MonthlyReportFactory.createL3SummaryResult();

    mockRepository.findL3Summary.mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findL3Summary).toHaveBeenCalledWith('SB');
    expect(result).toEqual(expectedResult);
  });

  it('should return correct totals structure', async () => {
    const expectedResult = MonthlyReportFactory.createL3SummaryResult();

    mockRepository.findL3Summary.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(result.totals).toHaveProperty('critical');
    expect(result.totals).toHaveProperty('high');
    expect(result.totals).toHaveProperty('medium');
    expect(result.totals).toHaveProperty('low');
    expect(result.totals).toHaveProperty('total');
  });

  it('should return data rows with correct structure', async () => {
    const expectedResult = MonthlyReportFactory.createL3SummaryResult();

    mockRepository.findL3Summary.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    result.data.forEach((row) => {
      expect(row).toHaveProperty('status');
      expect(row).toHaveProperty('statusLabel');
      expect(row).toHaveProperty('critical');
      expect(row).toHaveProperty('high');
      expect(row).toHaveProperty('medium');
      expect(row).toHaveProperty('low');
      expect(row).toHaveProperty('total');
    });
  });
});
