import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetStabilityIndicatorsUseCase } from '@monthly-report/application/use-cases/get-stability-indicators.use-case';
import type {
  IMonthlyReportRepository,
  StabilityIndicatorsResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('GetStabilityIndicatorsUseCase', () => {
  let useCase: GetStabilityIndicatorsUseCase;
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

    useCase = new GetStabilityIndicatorsUseCase(mockRepository);
  });

  const createMockResult = (overrides?: Partial<StabilityIndicatorsResult>): StabilityIndicatorsResult => ({
    data: [
      {
        application: 'Somos Belcorp',
        l2Count: 20,
        l3Count: 10,
        unmappedCount: 2,
        unmappedRequests: [
          { requestId: 123, requestIdLink: 'https://example.com/123', rawStatus: 'Unknown Status' },
          { requestId: 124, rawStatus: 'New Status' },
        ],
        total: 32,
      },
      {
        application: 'FFVV',
        l2Count: 15,
        l3Count: 8,
        unmappedCount: 0,
        unmappedRequests: [],
        total: 23,
      },
    ],
    hasUnmappedStatuses: true,
    ...overrides,
  });

  it('should return stability indicators data without filters', async () => {
    const expectedResult = createMockResult();

    vi.spyOn(mockRepository, 'findStabilityIndicators').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findStabilityIndicators).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result.data).toHaveLength(2);
    expect(result.hasUnmappedStatuses).toBe(true);
  });

  it('should return stability indicators filtered by app', async () => {
    const expectedResult = createMockResult({
      data: [createMockResult().data[0]],
    });

    vi.spyOn(mockRepository, 'findStabilityIndicators').mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findStabilityIndicators).toHaveBeenCalledWith('SB', undefined);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].application).toBe('Somos Belcorp');
  });

  it('should return stability indicators filtered by month', async () => {
    const expectedResult = createMockResult();

    vi.spyOn(mockRepository, 'findStabilityIndicators').mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-11');

    expect(mockRepository.findStabilityIndicators).toHaveBeenCalledWith(undefined, '2024-11');
    expect(result).toEqual(expectedResult);
  });

  it('should return stability indicators filtered by both app and month', async () => {
    const expectedResult = createMockResult({ hasUnmappedStatuses: false });

    vi.spyOn(mockRepository, 'findStabilityIndicators').mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-12');

    expect(mockRepository.findStabilityIndicators).toHaveBeenCalledWith('FF', '2024-12');
    expect(result).toEqual(expectedResult);
  });

  it('should return hasUnmappedStatuses as true when there are unmapped statuses', async () => {
    const expectedResult = createMockResult({
      data: [
        {
          application: 'App',
          l2Count: 10,
          l3Count: 5,
          unmappedCount: 3,
          unmappedRequests: [
            { requestId: 1, rawStatus: 'Status1' },
            { requestId: 2, rawStatus: 'Status2' },
            { requestId: 3, rawStatus: 'Status3' },
          ],
          total: 18,
        },
      ],
      hasUnmappedStatuses: true,
    });

    vi.spyOn(mockRepository, 'findStabilityIndicators').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(result.hasUnmappedStatuses).toBe(true);
    expect(result.data[0].unmappedCount).toBe(3);
    expect(result.data[0].unmappedRequests).toHaveLength(3);
  });

  it('should return hasUnmappedStatuses as false when no unmapped statuses', async () => {
    const expectedResult: StabilityIndicatorsResult = {
      data: [
        {
          application: 'App',
          l2Count: 10,
          l3Count: 5,
          unmappedCount: 0,
          unmappedRequests: [],
          total: 15,
        },
      ],
      hasUnmappedStatuses: false,
    };

    vi.spyOn(mockRepository, 'findStabilityIndicators').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(result.hasUnmappedStatuses).toBe(false);
    expect(result.data[0].unmappedCount).toBe(0);
  });

  it('should return empty data array when no incidents exist', async () => {
    const emptyResult: StabilityIndicatorsResult = {
      data: [],
      hasUnmappedStatuses: false,
    };

    vi.spyOn(mockRepository, 'findStabilityIndicators').mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(mockRepository.findStabilityIndicators).toHaveBeenCalledWith(undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.hasUnmappedStatuses).toBe(false);
  });
});
