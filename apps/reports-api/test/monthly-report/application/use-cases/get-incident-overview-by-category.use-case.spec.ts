import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetIncidentOverviewByCategoryUseCase } from '@monthly-report/application/use-cases/get-incident-overview-by-category.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetIncidentOverviewByCategoryUseCase', () => {
  let useCase: GetIncidentOverviewByCategoryUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetIncidentOverviewByCategoryUseCase(mockRepository);
  });

  it('should return incident overview without filters', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentOverviewByCategoryResult();

    mockRepository.findIncidentOverviewByCategory.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findIncidentOverviewByCategory).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveProperty('resolvedInL2');
    expect(result).toHaveProperty('pending');
    expect(result).toHaveProperty('recurrentInL2L3');
    expect(result).toHaveProperty('assignedToL3Backlog');
    expect(result).toHaveProperty('l3Status');
  });

  it('should return incident overview filtered by app', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentOverviewByCategoryResult();

    mockRepository.findIncidentOverviewByCategory.mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findIncidentOverviewByCategory).toHaveBeenCalledWith('SB', undefined, undefined);
    expect(result).toEqual(expectedResult);
  });

  it('should return incident overview filtered by date range', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentOverviewByCategoryResult();

    mockRepository.findIncidentOverviewByCategory.mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-01-01', '2024-01-31');

    expect(mockRepository.findIncidentOverviewByCategory).toHaveBeenCalledWith(undefined, '2024-01-01', '2024-01-31');
    expect(result).toEqual(expectedResult);
  });

  it('should return incident overview filtered by app and date range', async () => {
    const expectedResult = MonthlyReportFactory.createIncidentOverviewByCategoryResult();

    mockRepository.findIncidentOverviewByCategory.mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-02-01', '2024-02-28');

    expect(mockRepository.findIncidentOverviewByCategory).toHaveBeenCalledWith('FF', '2024-02-01', '2024-02-28');
    expect(result).toEqual(expectedResult);
  });
});
