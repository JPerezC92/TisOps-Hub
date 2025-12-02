import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCategoryDistributionUseCase } from '@monthly-report/application/use-cases/get-category-distribution.use-case';
import type {
  IMonthlyReportRepository,
  CategoryDistributionResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('GetCategoryDistributionUseCase', () => {
  let useCase: GetCategoryDistributionUseCase;
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

    useCase = new GetCategoryDistributionUseCase(mockRepository);
  });

  const createMockResult = (overrides?: Partial<CategoryDistributionResult>): CategoryDistributionResult => ({
    data: [
      {
        category: 'Incidente',
        recurringCount: 20,
        newCount: 15,
        unassignedCount: 5,
        unassignedRequests: [
          { requestId: 123, requestIdLink: 'https://example.com/123', rawRecurrency: 'Unknown' },
        ],
        total: 40,
        percentage: 50,
      },
      {
        category: 'Requerimiento',
        recurringCount: 10,
        newCount: 20,
        unassignedCount: 10,
        unassignedRequests: [],
        total: 40,
        percentage: 50,
      },
    ],
    monthName: 'October 2024',
    totalIncidents: 80,
    ...overrides,
  });

  it('should return category distribution data without filters', async () => {
    const expectedResult = createMockResult();

    vi.spyOn(mockRepository, 'findCategoryDistribution').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findCategoryDistribution).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result.data).toHaveLength(2);
    expect(result.totalIncidents).toBe(80);
  });

  it('should return category distribution filtered by app', async () => {
    const expectedResult = createMockResult({ totalIncidents: 30 });

    vi.spyOn(mockRepository, 'findCategoryDistribution').mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findCategoryDistribution).toHaveBeenCalledWith('SB', undefined);
    expect(result).toEqual(expectedResult);
  });

  it('should return category distribution filtered by month', async () => {
    const expectedResult = createMockResult({ monthName: 'November 2024' });

    vi.spyOn(mockRepository, 'findCategoryDistribution').mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-11');

    expect(mockRepository.findCategoryDistribution).toHaveBeenCalledWith(undefined, '2024-11');
    expect(result.monthName).toBe('November 2024');
  });

  it('should return category distribution filtered by both app and month', async () => {
    const expectedResult = createMockResult({ monthName: 'December 2024', totalIncidents: 15 });

    vi.spyOn(mockRepository, 'findCategoryDistribution').mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-12');

    expect(mockRepository.findCategoryDistribution).toHaveBeenCalledWith('FF', '2024-12');
    expect(result).toEqual(expectedResult);
  });

  it('should return empty data array when no incidents exist', async () => {
    const emptyResult: CategoryDistributionResult = {
      data: [],
      monthName: 'October 2024',
      totalIncidents: 0,
    };

    vi.spyOn(mockRepository, 'findCategoryDistribution').mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(mockRepository.findCategoryDistribution).toHaveBeenCalledWith(undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.totalIncidents).toBe(0);
  });
});
