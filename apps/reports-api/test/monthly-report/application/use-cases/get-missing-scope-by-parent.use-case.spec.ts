import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetMissingScopeByParentUseCase } from '@monthly-report/application/use-cases/get-missing-scope-by-parent.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetMissingScopeByParentUseCase', () => {
  let useCase: GetMissingScopeByParentUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetMissingScopeByParentUseCase(mockRepository);
  });

  it('should return missing scope by parent without filters', async () => {
    const expectedResult = MonthlyReportFactory.createMissingScopeByParentResult({ count: 5 });

    mockRepository.findMissingScopeByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findMissingScopeByParent).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('monthName');
    expect(result).toHaveProperty('totalIncidents');
  });

  it('should return missing scope by parent filtered by app', async () => {
    const expectedResult = MonthlyReportFactory.createMissingScopeByParentResult({ count: 3 });

    mockRepository.findMissingScopeByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findMissingScopeByParent).toHaveBeenCalledWith('SB', undefined);
    expect(result).toEqual(expectedResult);
  });

  it('should return missing scope by parent filtered by month', async () => {
    const expectedResult = MonthlyReportFactory.createMissingScopeByParentResult({
      count: 4,
      monthName: 'January',
    });

    mockRepository.findMissingScopeByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-01');

    expect(mockRepository.findMissingScopeByParent).toHaveBeenCalledWith(undefined, '2024-01');
    expect(result).toEqual(expectedResult);
  });

  it('should return missing scope by parent filtered by app and month', async () => {
    const expectedResult = MonthlyReportFactory.createMissingScopeByParentResult({ count: 2 });

    mockRepository.findMissingScopeByParent.mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-02');

    expect(mockRepository.findMissingScopeByParent).toHaveBeenCalledWith('FF', '2024-02');
    expect(result).toEqual(expectedResult);
  });

  it('should return data rows with correct structure', async () => {
    const expectedResult = MonthlyReportFactory.createMissingScopeByParentResult({ count: 1 });

    mockRepository.findMissingScopeByParent.mockResolvedValue(expectedResult);

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
});
