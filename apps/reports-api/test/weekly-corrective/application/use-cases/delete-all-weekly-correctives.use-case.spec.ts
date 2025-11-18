import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/delete-all-weekly-correctives.use-case';
import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';

describe('DeleteAllWeeklyCorrectivesUseCase', () => {
  let deleteAllWeeklyCorrectivesUseCase: DeleteAllWeeklyCorrectivesUseCase;
  let mockRepository: MockProxy<IWeeklyCorrectiveRepository>;

  beforeEach(() => {
    mockRepository = mock<IWeeklyCorrectiveRepository>();
    deleteAllWeeklyCorrectivesUseCase = new DeleteAllWeeklyCorrectivesUseCase(mockRepository);
  });

  it('should delete all weekly corrective records', async () => {
    mockRepository.deleteAll.mockResolvedValue(50);

    const result = await deleteAllWeeklyCorrectivesUseCase.execute();

    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(result).toEqual({
      message: 'All weekly corrective records deleted successfully',
      deleted: 50,
    });
  });

  it('should return zero when no records to delete', async () => {
    mockRepository.deleteAll.mockResolvedValue(0);

    const result = await deleteAllWeeklyCorrectivesUseCase.execute();

    expect(result.deleted).toBe(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.deleteAll.mockRejectedValue(error);

    await expect(deleteAllWeeklyCorrectivesUseCase.execute()).rejects.toThrow('Database error');
  });
});
