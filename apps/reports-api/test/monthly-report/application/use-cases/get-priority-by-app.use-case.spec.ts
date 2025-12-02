import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPriorityByAppUseCase } from '@monthly-report/application/use-cases/get-priority-by-app.use-case';
import type {
  IMonthlyReportRepository,
  PriorityByAppResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('GetPriorityByAppUseCase', () => {
  let useCase: GetPriorityByAppUseCase;
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

    useCase = new GetPriorityByAppUseCase(mockRepository);
  });

  const createMockResult = (overrides?: Partial<PriorityByAppResult>): PriorityByAppResult => ({
    data: [
      {
        application: 'Somos Belcorp',
        criticalCount: 5,
        highCount: 10,
        mediumCount: 15,
        lowCount: 20,
        total: 50,
      },
      {
        application: 'FFVV',
        criticalCount: 3,
        highCount: 8,
        mediumCount: 12,
        lowCount: 7,
        total: 30,
      },
    ],
    monthName: 'October 2024',
    totalIncidents: 80,
    ...overrides,
  });

  it('should return priority by app data without filters', async () => {
    const expectedResult = createMockResult();

    vi.spyOn(mockRepository, 'findPriorityByApp').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findPriorityByApp).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result.data).toHaveLength(2);
    expect(result.totalIncidents).toBe(80);
  });

  it('should return priority by app filtered by app', async () => {
    const expectedResult = createMockResult({
      data: [createMockResult().data[0]],
      totalIncidents: 50,
    });

    vi.spyOn(mockRepository, 'findPriorityByApp').mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findPriorityByApp).toHaveBeenCalledWith('SB', undefined);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].application).toBe('Somos Belcorp');
  });

  it('should return priority by app filtered by month', async () => {
    const expectedResult = createMockResult({ monthName: 'November 2024' });

    vi.spyOn(mockRepository, 'findPriorityByApp').mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-11');

    expect(mockRepository.findPriorityByApp).toHaveBeenCalledWith(undefined, '2024-11');
    expect(result.monthName).toBe('November 2024');
  });

  it('should return priority by app filtered by both app and month', async () => {
    const expectedResult = createMockResult({ monthName: 'December 2024', totalIncidents: 25 });

    vi.spyOn(mockRepository, 'findPriorityByApp').mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-12');

    expect(mockRepository.findPriorityByApp).toHaveBeenCalledWith('FF', '2024-12');
    expect(result).toEqual(expectedResult);
  });

  it('should return empty data array when no incidents exist', async () => {
    const emptyResult: PriorityByAppResult = {
      data: [],
      monthName: 'October 2024',
      totalIncidents: 0,
    };

    vi.spyOn(mockRepository, 'findPriorityByApp').mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(mockRepository.findPriorityByApp).toHaveBeenCalledWith(undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.totalIncidents).toBe(0);
  });
});
