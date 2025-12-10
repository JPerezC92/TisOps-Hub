import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import {
  GetCriticalIncidentsAnalyticsUseCase,
  CriticalIncidentResponse,
} from '@monthly-report/application/use-cases/get-critical-incidents-analytics.use-case';
import { IMonthlyReportRepository, CriticalIncidentWithMapping } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { Priority } from '@repo/reports';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetCriticalIncidentsAnalyticsUseCase', () => {
  let useCase: GetCriticalIncidentsAnalyticsUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetCriticalIncidentsAnalyticsUseCase(mockRepository);
  });

  it('should return critical incidents without filters', async () => {
    const mockData = MonthlyReportFactory.createManyCriticalIncidentsWithMapping(3, {
      priority: Priority.Critical,
    });

    mockRepository.findCriticalIncidentsFiltered.mockResolvedValue(mockData);

    const result = await useCase.execute();

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toHaveLength(3);
    // Verify the result is flattened with mapping fields
    result.forEach((item: CriticalIncidentResponse, index: number) => {
      expect(item.requestId).toBe(mockData[index].monthlyReport.requestId);
      expect(item.mappedModuleDisplayValue).toBe(mockData[index].mappedModuleDisplayValue);
      expect(item.mappedStatusDisplayValue).toBe(mockData[index].mappedStatusDisplayValue);
      expect(item.mappedCategorizationDisplayValue).toBe(mockData[index].mappedCategorizationDisplayValue);
    });
  });

  it('should return critical incidents filtered by app', async () => {
    const mockData = MonthlyReportFactory.createManyCriticalIncidentsWithMapping(2, {
      priority: Priority.Critical,
      aplicativos: 'Somos Belcorp',
    });

    mockRepository.findCriticalIncidentsFiltered.mockResolvedValue(mockData);

    const result = await useCase.execute('SB');

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith('SB', undefined);
    expect(result).toHaveLength(2);
    result.forEach((item: CriticalIncidentResponse) => {
      expect(item.aplicativos).toBe('Somos Belcorp');
      expect(item).toHaveProperty('mappedModuleDisplayValue');
      expect(item).toHaveProperty('mappedStatusDisplayValue');
      expect(item).toHaveProperty('mappedCategorizationDisplayValue');
    });
  });

  it('should return critical incidents filtered by month', async () => {
    const mockData = MonthlyReportFactory.createManyCriticalIncidentsWithMapping(4, {
      priority: Priority.Critical,
      createdTime: '15/10/2024 10:30',
    });

    mockRepository.findCriticalIncidentsFiltered.mockResolvedValue(mockData);

    const result = await useCase.execute(undefined, '2024-10');

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith(undefined, '2024-10');
    expect(result).toHaveLength(4);
    result.forEach((item: CriticalIncidentResponse) => {
      expect(item.createdTime).toBe('15/10/2024 10:30');
    });
  });

  it('should return critical incidents filtered by both app and month', async () => {
    const mockData = MonthlyReportFactory.createManyCriticalIncidentsWithMapping(1, {
      priority: Priority.Critical,
      aplicativos: 'FFVV',
      createdTime: '20/11/2024 14:00',
    });

    mockRepository.findCriticalIncidentsFiltered.mockResolvedValue(mockData);

    const result = await useCase.execute('FF', '2024-11');

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith('FF', '2024-11');
    expect(result).toHaveLength(1);
    expect(result[0].aplicativos).toBe('FFVV');
    expect(result[0].createdTime).toBe('20/11/2024 14:00');
  });

  it('should return empty array when no critical incidents exist', async () => {
    mockRepository.findCriticalIncidentsFiltered.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should flatten nested structure correctly', async () => {
    const mockData: CriticalIncidentWithMapping[] = [
      {
        monthlyReport: MonthlyReportFactory.createMonthlyReport({
          requestId: 123456,
          priority: Priority.Critical,
        }),
        mappedModuleDisplayValue: 'Orders Module',
        mappedStatusDisplayValue: 'In Progress',
        mappedCategorizationDisplayValue: 'Incident',
      },
    ];

    mockRepository.findCriticalIncidentsFiltered.mockResolvedValue(mockData);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].requestId).toBe(123456);
    expect(result[0].mappedModuleDisplayValue).toBe('Orders Module');
    expect(result[0].mappedStatusDisplayValue).toBe('In Progress');
    expect(result[0].mappedCategorizationDisplayValue).toBe('Incident');
    // Verify all MonthlyReport properties are preserved
    expect(result[0].priority).toBe(Priority.Critical);
  });
});
