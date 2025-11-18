import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/get-all-weekly-correctives.use-case';
import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import { WeeklyCorrectiveFactory } from '../../helpers/weekly-corrective.factory';

describe('GetAllWeeklyCorrectivesUseCase', () => {
  let getAllWeeklyCorrectivesUseCase: GetAllWeeklyCorrectivesUseCase;
  let mockRepository: MockProxy<IWeeklyCorrectiveRepository>;

  beforeEach(() => {
    mockRepository = mock<IWeeklyCorrectiveRepository>();
    getAllWeeklyCorrectivesUseCase = new GetAllWeeklyCorrectivesUseCase(mockRepository);
  });

  it('should return all weekly correctives', async () => {
    const expectedRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(3);

    mockRepository.findAll.mockResolvedValue(expectedRecords);
    mockRepository.countAll.mockResolvedValue(3);

    const result = await getAllWeeklyCorrectivesUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(mockRepository.countAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: expectedRecords, total: 3 });
  });

  it('should return empty array when no records exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);
    mockRepository.countAll.mockResolvedValue(0);

    const result = await getAllWeeklyCorrectivesUseCase.execute();

    expect(result).toEqual({ data: [], total: 0 });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(getAllWeeklyCorrectivesUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should call findAll and countAll in parallel', async () => {
    const expectedRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(2);

    mockRepository.findAll.mockResolvedValue(expectedRecords);
    mockRepository.countAll.mockResolvedValue(2);

    await getAllWeeklyCorrectivesUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(mockRepository.countAll).toHaveBeenCalled();
  });
});
