import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetBugsByParentUseCase } from '@monthly-report/application/use-cases/get-bugs-by-parent.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetBugsByParentUseCase', () => {
  let useCase: GetBugsByParentUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetBugsByParentUseCase(mockRepository);
  });

  it('should return bugs by parent without filters', async () => {
    const expectedResult = MonthlyReportFactory.createBugsByParentResult({ count: 5 });

    mockRepository.findBugsByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findBugsByParent).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('monthName');
    expect(result).toHaveProperty('totalIncidents');
  });

  it('should return bugs by parent filtered by app', async () => {
    const expectedResult = MonthlyReportFactory.createBugsByParentResult({ count: 3 });

    mockRepository.findBugsByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findBugsByParent).toHaveBeenCalledWith('SB', undefined);
    expect(result).toEqual(expectedResult);
  });

  it('should return bugs by parent filtered by month', async () => {
    const expectedResult = MonthlyReportFactory.createBugsByParentResult({
      count: 4,
      monthName: 'February',
    });

    mockRepository.findBugsByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-02');

    expect(mockRepository.findBugsByParent).toHaveBeenCalledWith(undefined, '2024-02');
    expect(result).toEqual(expectedResult);
  });

  it('should return bugs by parent filtered by app and month', async () => {
    const expectedResult = MonthlyReportFactory.createBugsByParentResult({ count: 2 });

    mockRepository.findBugsByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-03');

    expect(mockRepository.findBugsByParent).toHaveBeenCalledWith('FF', '2024-03');
    expect(result).toEqual(expectedResult);
  });

  it('should return data rows with correct structure', async () => {
    const expectedResult = MonthlyReportFactory.createBugsByParentResult({ count: 1 });

    mockRepository.findBugsByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    result.data.forEach((row) => {
      expect(row).toHaveProperty('createdDate');
      expect(row).toHaveProperty('linkedRequestId');
      expect(row).toHaveProperty('additionalInfo');
      expect(row).toHaveProperty('totalLinkedTickets');
      expect(row).toHaveProperty('linkedTicketsInMonth');
      expect(row).toHaveProperty('requestStatus');
      expect(row).toHaveProperty('eta');
    });
  });

  it('should return empty data array when no bugs exist', async () => {
    const emptyResult = {
      data: [],
      monthName: 'March',
      totalIncidents: 0,
    };

    mockRepository.findBugsByParent.mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(result.data).toEqual([]);
    expect(result.totalIncidents).toBe(0);
  });
});
