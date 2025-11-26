import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCriticalIncidentsAnalyticsUseCase } from '@monthly-report/application/use-cases/get-critical-incidents-analytics.use-case';
import { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { Priority } from '@repo/reports';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetCriticalIncidentsAnalyticsUseCase', () => {
  let useCase: GetCriticalIncidentsAnalyticsUseCase;
  let mockRepository: IMonthlyReportRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      countAll: vi.fn(),
      bulkCreate: vi.fn(),
      deleteAll: vi.fn(),
      findCriticalIncidentsFiltered: vi.fn(),
    };

    useCase = new GetCriticalIncidentsAnalyticsUseCase(mockRepository);
  });

  it('should return critical incidents without filters', async () => {
    const expectedIncidents = MonthlyReportFactory.createManyMonthlyReports(3, {
      priority: Priority.Critical,
    });

    vi.spyOn(mockRepository, 'findCriticalIncidentsFiltered').mockResolvedValue(expectedIncidents);

    const result = await useCase.execute();

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedIncidents);
    expect(result).toHaveLength(3);
  });

  it('should return critical incidents filtered by app', async () => {
    const expectedIncidents = MonthlyReportFactory.createManyMonthlyReports(2, {
      priority: Priority.Critical,
      aplicativos: 'Somos Belcorp',
    });

    vi.spyOn(mockRepository, 'findCriticalIncidentsFiltered').mockResolvedValue(expectedIncidents);

    const result = await useCase.execute('SB');

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith('SB', undefined);
    expect(result).toEqual(expectedIncidents);
    expect(result).toHaveLength(2);
  });

  it('should return critical incidents filtered by month', async () => {
    const expectedIncidents = MonthlyReportFactory.createManyMonthlyReports(4, {
      priority: Priority.Critical,
      createdTime: '15/10/2024 10:30',
    });

    vi.spyOn(mockRepository, 'findCriticalIncidentsFiltered').mockResolvedValue(expectedIncidents);

    const result = await useCase.execute(undefined, '2024-10');

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith(undefined, '2024-10');
    expect(result).toEqual(expectedIncidents);
    expect(result).toHaveLength(4);
  });

  it('should return critical incidents filtered by both app and month', async () => {
    const expectedIncidents = MonthlyReportFactory.createManyMonthlyReports(1, {
      priority: Priority.Critical,
      aplicativos: 'FFVV',
      createdTime: '20/11/2024 14:00',
    });

    vi.spyOn(mockRepository, 'findCriticalIncidentsFiltered').mockResolvedValue(expectedIncidents);

    const result = await useCase.execute('FF', '2024-11');

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith('FF', '2024-11');
    expect(result).toEqual(expectedIncidents);
    expect(result).toHaveLength(1);
  });

  it('should return empty array when no critical incidents exist', async () => {
    vi.spyOn(mockRepository, 'findCriticalIncidentsFiltered').mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
