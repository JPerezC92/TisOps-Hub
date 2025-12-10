import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetBusinessFlowPriorityUseCase } from '@monthly-report/application/use-cases/get-business-flow-priority.use-case';
import type {
  IMonthlyReportRepository,
  BusinessFlowPriorityResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('GetBusinessFlowPriorityUseCase', () => {
  let useCase: GetBusinessFlowPriorityUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetBusinessFlowPriorityUseCase(mockRepository);
  });

  const createMockResult = (overrides?: Partial<BusinessFlowPriorityResult>): BusinessFlowPriorityResult => ({
    data: [
      {
        priority: 'Critical',
        totalCount: 10,
        modules: [
          { moduleSourceValue: 'SB2 Pase de Pedidos', moduleDisplayValue: 'Order Placement', count: 6 },
          { moduleSourceValue: 'SB2 Multipedido', moduleDisplayValue: 'Multi-Order', count: 4 },
        ],
      },
      {
        priority: 'High',
        totalCount: 15,
        modules: [
          { moduleSourceValue: 'SB2 Pase de Pedidos', moduleDisplayValue: 'Order Placement', count: 8 },
          { moduleSourceValue: 'Unknown Module', moduleDisplayValue: null, count: 7 },
        ],
      },
    ],
    monthName: 'October 2024',
    totalIncidents: 25,
    ...overrides,
  });

  it('should return business flow priority data without filters', async () => {
    const expectedResult = createMockResult();

    mockRepository.findBusinessFlowByPriority.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findBusinessFlowByPriority).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result.data).toHaveLength(2);
    expect(result.totalIncidents).toBe(25);
  });

  it('should return business flow priority filtered by app', async () => {
    const expectedResult = createMockResult({ totalIncidents: 15 });

    mockRepository.findBusinessFlowByPriority.mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findBusinessFlowByPriority).toHaveBeenCalledWith('SB', undefined);
    expect(result).toEqual(expectedResult);
  });

  it('should return business flow priority filtered by month', async () => {
    const expectedResult = createMockResult({ monthName: 'November 2024' });

    mockRepository.findBusinessFlowByPriority.mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-11');

    expect(mockRepository.findBusinessFlowByPriority).toHaveBeenCalledWith(undefined, '2024-11');
    expect(result.monthName).toBe('November 2024');
  });

  it('should return business flow priority filtered by both app and month', async () => {
    const expectedResult = createMockResult({ monthName: 'December 2024', totalIncidents: 5 });

    mockRepository.findBusinessFlowByPriority.mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-12');

    expect(mockRepository.findBusinessFlowByPriority).toHaveBeenCalledWith('FF', '2024-12');
    expect(result).toEqual(expectedResult);
  });

  it('should return empty data array when no incidents exist', async () => {
    const emptyResult: BusinessFlowPriorityResult = {
      data: [],
      monthName: 'October 2024',
      totalIncidents: 0,
    };

    mockRepository.findBusinessFlowByPriority.mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(mockRepository.findBusinessFlowByPriority).toHaveBeenCalledWith(undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.totalIncidents).toBe(0);
  });
});
