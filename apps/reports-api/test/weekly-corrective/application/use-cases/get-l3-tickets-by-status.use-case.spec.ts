import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetL3TicketsByStatusUseCase } from '@weekly-corrective/application/use-cases/get-l3-tickets-by-status.use-case';
import type {
  IWeeklyCorrectiveRepository,
  L3TicketsByStatusResult,
} from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';

describe('GetL3TicketsByStatusUseCase', () => {
  let useCase: GetL3TicketsByStatusUseCase;
  let mockRepository: IWeeklyCorrectiveRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      countAll: vi.fn(),
      bulkCreate: vi.fn(),
      deleteAll: vi.fn(),
      findL3TicketsByStatus: vi.fn(),
    };

    useCase = new GetL3TicketsByStatusUseCase(mockRepository);
  });

  const createMockResult = (overrides?: Partial<L3TicketsByStatusResult>): L3TicketsByStatusResult => ({
    data: [
      {
        application: 'Somos Belcorp',
        statusCounts: {
          'In L3 Backlog': 10,
          'In Progress': 5,
          'Resolved': 8,
        },
        total: 23,
      },
      {
        application: 'FFVV',
        statusCounts: {
          'In L3 Backlog': 7,
          'In Progress': 3,
          'On Hold': 2,
        },
        total: 12,
      },
    ],
    statusColumns: ['In L3 Backlog', 'In Progress', 'Resolved', 'On Hold'],
    monthName: 'October 2024',
    totalL3Tickets: 35,
    ...overrides,
  });

  it('should return L3 tickets by status data without filters', async () => {
    const expectedResult = createMockResult();

    vi.spyOn(mockRepository, 'findL3TicketsByStatus').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findL3TicketsByStatus).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expectedResult);
    expect(result.data).toHaveLength(2);
    expect(result.statusColumns).toHaveLength(4);
    expect(result.totalL3Tickets).toBe(35);
  });

  it('should return L3 tickets by status filtered by app', async () => {
    const expectedResult = createMockResult({
      data: [createMockResult().data[0]],
      totalL3Tickets: 23,
    });

    vi.spyOn(mockRepository, 'findL3TicketsByStatus').mockResolvedValue(expectedResult);

    const result = await useCase.execute('SB');

    expect(mockRepository.findL3TicketsByStatus).toHaveBeenCalledWith('SB', undefined);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].application).toBe('Somos Belcorp');
  });

  it('should return L3 tickets by status filtered by month', async () => {
    const expectedResult = createMockResult({ monthName: 'November 2024' });

    vi.spyOn(mockRepository, 'findL3TicketsByStatus').mockResolvedValue(expectedResult);

    const result = await useCase.execute(undefined, '2024-11');

    expect(mockRepository.findL3TicketsByStatus).toHaveBeenCalledWith(undefined, '2024-11');
    expect(result.monthName).toBe('November 2024');
  });

  it('should return L3 tickets by status filtered by both app and month', async () => {
    const expectedResult = createMockResult({ monthName: 'December 2024', totalL3Tickets: 15 });

    vi.spyOn(mockRepository, 'findL3TicketsByStatus').mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF', '2024-12');

    expect(mockRepository.findL3TicketsByStatus).toHaveBeenCalledWith('FF', '2024-12');
    expect(result).toEqual(expectedResult);
  });

  it('should return empty data array with empty statusColumns when no tickets exist', async () => {
    const emptyResult: L3TicketsByStatusResult = {
      data: [],
      statusColumns: [],
      monthName: 'October 2024',
      totalL3Tickets: 0,
    };

    vi.spyOn(mockRepository, 'findL3TicketsByStatus').mockResolvedValue(emptyResult);

    const result = await useCase.execute();

    expect(mockRepository.findL3TicketsByStatus).toHaveBeenCalledWith(undefined, undefined);
    expect(result.data).toEqual([]);
    expect(result.statusColumns).toEqual([]);
    expect(result.totalL3Tickets).toBe(0);
  });

  it('should handle dynamic status columns correctly', async () => {
    const expectedResult: L3TicketsByStatusResult = {
      data: [
        {
          application: 'App1',
          statusCounts: {
            'Custom Status 1': 5,
            'Custom Status 2': 3,
          },
          total: 8,
        },
      ],
      statusColumns: ['Custom Status 1', 'Custom Status 2'],
      monthName: 'October 2024',
      totalL3Tickets: 8,
    };

    vi.spyOn(mockRepository, 'findL3TicketsByStatus').mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(result.statusColumns).toContain('Custom Status 1');
    expect(result.statusColumns).toContain('Custom Status 2');
    expect(result.data[0].statusCounts['Custom Status 1']).toBe(5);
  });
});
