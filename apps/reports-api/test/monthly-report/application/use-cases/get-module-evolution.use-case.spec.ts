import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetModuleEvolutionUseCase } from '@monthly-report/application/use-cases/get-module-evolution.use-case';
import type {
  IMonthlyReportRepository,
  ModuleEvolutionResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('GetModuleEvolutionUseCase', () => {
  let useCase: GetModuleEvolutionUseCase;
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

    useCase = new GetModuleEvolutionUseCase(mockRepository);
  });

  const createMockModules = (): ModuleEvolutionResult[] => [
    {
      module: 'Module A',
      count: 30,
      percentage: 50,
      categorizations: [
        {
          categorization: 'Bug Fix',
          count: 20,
          percentage: 66.67,
          tickets: [
            {
              subject: 'Fix login issue',
              requestId: 123,
              requestIdLink: 'https://example.com/123',
              parentTicketId: 'TICKET-001',
              linkedTicketsCount: 2,
              additionalInfo: 'Critical issue',
              displayStatus: 'Resolved',
              isUnmapped: false,
            },
          ],
        },
      ],
    },
    {
      module: 'Module B',
      count: 30,
      percentage: 50,
      categorizations: [],
    },
  ];

  it('should return module evolution data without filters and calculate total', async () => {
    const mockModules = createMockModules();

    vi.spyOn(mockRepository, 'findModuleEvolution').mockResolvedValue(mockModules);

    const result = await useCase.execute();

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result.data).toEqual(mockModules);
    expect(result.total).toBe(60); // 30 + 30
  });

  it('should return module evolution filtered by app', async () => {
    const mockModules = [createMockModules()[0]];

    vi.spyOn(mockRepository, 'findModuleEvolution').mockResolvedValue(mockModules);

    const result = await useCase.execute('SB');

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith('SB', undefined, undefined);
    expect(result.data).toEqual(mockModules);
    expect(result.total).toBe(30);
  });

  it('should return module evolution filtered by date range', async () => {
    const mockModules = createMockModules();

    vi.spyOn(mockRepository, 'findModuleEvolution').mockResolvedValue(mockModules);

    const result = await useCase.execute(undefined, '2024-10-01', '2024-10-31');

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith(undefined, '2024-10-01', '2024-10-31');
    expect(result.data).toEqual(mockModules);
  });

  it('should return module evolution filtered by app and date range', async () => {
    const mockModules = [createMockModules()[0]];

    vi.spyOn(mockRepository, 'findModuleEvolution').mockResolvedValue(mockModules);

    const result = await useCase.execute('FF', '2024-11-01', '2024-11-30');

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith('FF', '2024-11-01', '2024-11-30');
    expect(result).toEqual({ data: mockModules, total: 30 });
  });

  it('should return empty data array and zero total when no modules exist', async () => {
    vi.spyOn(mockRepository, 'findModuleEvolution').mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should correctly sum counts from multiple modules', async () => {
    const mockModules: ModuleEvolutionResult[] = [
      { module: 'A', count: 10, percentage: 25, categorizations: [] },
      { module: 'B', count: 15, percentage: 37.5, categorizations: [] },
      { module: 'C', count: 5, percentage: 12.5, categorizations: [] },
      { module: 'D', count: 10, percentage: 25, categorizations: [] },
    ];

    vi.spyOn(mockRepository, 'findModuleEvolution').mockResolvedValue(mockModules);

    const result = await useCase.execute();

    expect(result.total).toBe(40); // 10 + 15 + 5 + 10
    expect(result.data).toHaveLength(4);
  });
});
