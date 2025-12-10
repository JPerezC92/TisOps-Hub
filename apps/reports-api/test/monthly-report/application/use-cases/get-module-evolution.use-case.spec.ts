import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetModuleEvolutionUseCase } from '@monthly-report/application/use-cases/get-module-evolution.use-case';
import type {
  IMonthlyReportRepository,
  ModuleEvolutionResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('GetModuleEvolutionUseCase', () => {
  let useCase: GetModuleEvolutionUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetModuleEvolutionUseCase(mockRepository);
  });

  const createMockModules = (): ModuleEvolutionResult[] => [
    {
      moduleSourceValue: 'SB2 Pase de Pedidos',
      moduleDisplayValue: 'Order Placement',
      count: 30,
      percentage: 50,
      categorizations: [
        {
          categorizationSourceValue: 'Error de codificación (Bug)',
          categorizationDisplayValue: 'Bugs',
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
      moduleSourceValue: 'SB2 Reserva de Pedidos',
      moduleDisplayValue: 'Order Reservation',
      count: 30,
      percentage: 50,
      categorizations: [],
    },
  ];

  it('should return module evolution data without filters and calculate total', async () => {
    const mockModules = createMockModules();

    mockRepository.findModuleEvolution.mockResolvedValue(mockModules);

    const result = await useCase.execute();

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result.data).toEqual(mockModules);
    expect(result.total).toBe(60); // 30 + 30
  });

  it('should return module evolution filtered by app', async () => {
    const mockModules = [createMockModules()[0]];

    mockRepository.findModuleEvolution.mockResolvedValue(mockModules);

    const result = await useCase.execute('SB');

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith('SB', undefined, undefined);
    expect(result.data).toEqual(mockModules);
    expect(result.total).toBe(30);
  });

  it('should return module evolution filtered by date range', async () => {
    const mockModules = createMockModules();

    mockRepository.findModuleEvolution.mockResolvedValue(mockModules);

    const result = await useCase.execute(undefined, '2024-10-01', '2024-10-31');

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith(undefined, '2024-10-01', '2024-10-31');
    expect(result.data).toEqual(mockModules);
  });

  it('should return module evolution filtered by app and date range', async () => {
    const mockModules = [createMockModules()[0]];

    mockRepository.findModuleEvolution.mockResolvedValue(mockModules);

    const result = await useCase.execute('FF', '2024-11-01', '2024-11-30');

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith('FF', '2024-11-01', '2024-11-30');
    expect(result).toEqual({ data: mockModules, total: 30 });
  });

  it('should return empty data array and zero total when no modules exist', async () => {
    mockRepository.findModuleEvolution.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findModuleEvolution).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should correctly sum counts from multiple modules', async () => {
    const mockModules: ModuleEvolutionResult[] = [
      { moduleSourceValue: 'Module A', moduleDisplayValue: 'Mapped A', count: 10, percentage: 25, categorizations: [] },
      { moduleSourceValue: 'Module B', moduleDisplayValue: 'Mapped B', count: 15, percentage: 37.5, categorizations: [] },
      { moduleSourceValue: 'Module C', moduleDisplayValue: null, count: 5, percentage: 12.5, categorizations: [] },
      { moduleSourceValue: 'Module D', moduleDisplayValue: null, count: 10, percentage: 25, categorizations: [] },
    ];

    mockRepository.findModuleEvolution.mockResolvedValue(mockModules);

    const result = await useCase.execute();

    expect(result.total).toBe(40); // 10 + 15 + 5 + 10
    expect(result.data).toHaveLength(4);
  });

  it('should handle modules with null display values (unmapped)', async () => {
    const mockModules: ModuleEvolutionResult[] = [
      {
        moduleSourceValue: 'Unknown Module',
        moduleDisplayValue: null,
        count: 10,
        percentage: 100,
        categorizations: [
          {
            categorizationSourceValue: 'Unknown Category',
            categorizationDisplayValue: null,
            count: 10,
            percentage: 100,
            tickets: [],
          },
        ],
      },
    ];

    mockRepository.findModuleEvolution.mockResolvedValue(mockModules);

    const result = await useCase.execute();

    expect(result.data[0].moduleDisplayValue).toBeNull();
    expect(result.data[0].moduleSourceValue).toBe('Unknown Module');
    expect(result.data[0].categorizations[0].categorizationDisplayValue).toBeNull();
    expect(result.data[0].categorizations[0].categorizationSourceValue).toBe('Unknown Category');
  });

  it('should return both source and display values for mapped modules', async () => {
    const mockModules: ModuleEvolutionResult[] = [
      {
        moduleSourceValue: 'SB2 Ofertas Gana+',
        moduleDisplayValue: 'Gana+ Offers',
        count: 5,
        percentage: 100,
        categorizations: [
          {
            categorizationSourceValue: 'Error de datos (Data Source)',
            categorizationDisplayValue: 'Data Source',
            count: 5,
            percentage: 100,
            tickets: [],
          },
        ],
      },
    ];

    mockRepository.findModuleEvolution.mockResolvedValue(mockModules);

    const result = await useCase.execute();

    expect(result.data[0].moduleSourceValue).toBe('SB2 Ofertas Gana+');
    expect(result.data[0].moduleDisplayValue).toBe('Gana+ Offers');
    expect(result.data[0].categorizations[0].categorizationSourceValue).toBe('Error de datos (Data Source)');
    expect(result.data[0].categorizations[0].categorizationDisplayValue).toBe('Data Source');
  });
});
