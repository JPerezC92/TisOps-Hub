import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetIncidentsByDayUseCase } from '@monthly-report/application/use-cases/get-incidents-by-day.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetIncidentsByDayUseCase', () => {
  let useCase: GetIncidentsByDayUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetIncidentsByDayUseCase(mockRepository);
  });

  it('should return incidents by day without filters', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentsByDayResult({ days: 31 });

    mockRepository.findIncidentsByDay.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findIncidentsByDay).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('totalIncidents');
  });

  it('should return incidents by day filtered by app', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentsByDayResult({ days: 31 });

    mockRepository.findIncidentsByDay.mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findIncidentsByDay).toHaveBeenCalledWith('SB');
    expect(result).toEqual(expectedResult);
  });

  it('should return data rows with correct structure', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentsByDayResult({ days: 10 });

    mockRepository.findIncidentsByDay.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    result.data.forEach((row) => {
      expect(row).toHaveProperty('day');
      expect(row).toHaveProperty('count');
      expect(typeof row.day).toBe('number');
      expect(typeof row.count).toBe('number');
    });
  });

  it('should return correct totalIncidents sum', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentsByDayResult({ days: 5 });

    mockRepository.findIncidentsByDay.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    const calculatedTotal = result.data.reduce((sum, row) => sum + row.count, 0);
    expect(result.totalIncidents).toBe(calculatedTotal);
  });

  it('should return empty data array when no incidents exist', async () => {
    const emptyResult = {
      data: [],
      totalIncidents: 0,
    };

    mockRepository.findIncidentsByDay.mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(result.data).toEqual([]);
    expect(result.totalIncidents).toBe(0);
  });

  it('should return days with valid day numbers (1-31)', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentsByDayResult({ days: 31 });

    mockRepository.findIncidentsByDay.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    result.data.forEach((row) => {
      expect(row.day).toBeGreaterThanOrEqual(1);
      expect(row.day).toBeLessThanOrEqual(31);
    });
  });
});
