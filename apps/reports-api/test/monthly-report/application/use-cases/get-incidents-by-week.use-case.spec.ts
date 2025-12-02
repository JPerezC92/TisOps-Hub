import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetIncidentsByWeekUseCase } from '@monthly-report/application/use-cases/get-incidents-by-week.use-case';
import type {
  IMonthlyReportRepository,
  IncidentsByWeekResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('GetIncidentsByWeekUseCase', () => {
  let useCase: GetIncidentsByWeekUseCase;
  let mockRepository: IMonthlyReportRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      countAll: vi.fn(),
      bulkCreate: vi.fn(),
      deleteAll: vi.fn(),
      findCriticalIncidentsFiltered: vi.fn(),
      findModuleEvolution: vi.fn(),
      findStabilityIndicators: vi.fn(),
      findCategoryDistribution: vi.fn(),
      findBusinessFlowByPriority: vi.fn(),
      findPriorityByApp: vi.fn(),
      findIncidentsByWeek: vi.fn(),
    };

    useCase = new GetIncidentsByWeekUseCase(mockRepository);
  });

  const createMockResult = (overrides?: Partial<IncidentsByWeekResult>): IncidentsByWeekResult => ({
    data: [
      {
        weekNumber: 40,
        year: 2024,
        count: 15,
        startDate: '2024-09-30',
        endDate: '2024-10-06',
      },
      {
        weekNumber: 41,
        year: 2024,
        count: 20,
        startDate: '2024-10-07',
        endDate: '2024-10-13',
      },
      {
        weekNumber: 42,
        year: 2024,
        count: 12,
        startDate: '2024-10-14',
        endDate: '2024-10-20',
      },
    ],
    year: 2024,
    totalIncidents: 47,
    ...overrides,
  });

  it('should return incidents by week data without filters', async () => {
    const expectedResult = createMockResult();

    vi.spyOn(mockRepository, 'findIncidentsByWeek').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findIncidentsByWeek).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result.data).toHaveLength(3);
    expect(result.totalIncidents).toBe(47);
  });

  it('should return incidents by week filtered by app', async () => {
    const expectedResult = createMockResult({ totalIncidents: 25 });

    vi.spyOn(mockRepository, 'findIncidentsByWeek').mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findIncidentsByWeek).toHaveBeenCalledWith('SB', undefined);
    expect(result).toEqual(expectedResult);
  });

  it('should return incidents by week filtered by year', async () => {
    const expectedResult = createMockResult({ year: 2023 });

    vi.spyOn(mockRepository, 'findIncidentsByWeek').mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, 2023);

    expect(mockRepository.findIncidentsByWeek).toHaveBeenCalledWith(undefined, 2023);
    expect(result.year).toBe(2023);
  });

  it('should return incidents by week filtered by both app and year', async () => {
    const expectedResult = createMockResult({ year: 2025, totalIncidents: 10 });

    vi.spyOn(mockRepository, 'findIncidentsByWeek').mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', 2025);

    expect(mockRepository.findIncidentsByWeek).toHaveBeenCalledWith('FF', 2025);
    expect(result).toEqual(expectedResult);
  });

  it('should return empty data array when no incidents exist', async () => {
    const emptyResult: IncidentsByWeekResult = {
      data: [],
      year: 2024,
      totalIncidents: 0,
    };

    vi.spyOn(mockRepository, 'findIncidentsByWeek').mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(mockRepository.findIncidentsByWeek).toHaveBeenCalledWith(undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.totalIncidents).toBe(0);
  });
});
