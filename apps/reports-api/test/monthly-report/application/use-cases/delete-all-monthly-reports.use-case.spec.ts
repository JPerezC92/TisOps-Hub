import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteAllMonthlyReportsUseCase } from '@monthly-report/application/use-cases/delete-all-monthly-reports.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';

describe('DeleteAllMonthlyReportsUseCase', () => {
  let deleteAllMonthlyReportsUseCase: DeleteAllMonthlyReportsUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    deleteAllMonthlyReportsUseCase = new DeleteAllMonthlyReportsUseCase(mockRepository);
  });

  it('should delete all monthly reports', async () => {
    mockRepository.deleteAll.mockResolvedValue(50);

    const result = await deleteAllMonthlyReportsUseCase.execute();

    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(result).toEqual({
      message: 'All monthly report records deleted successfully',
      deleted: 50,
    });
  });

  it('should return zero when no records to delete', async () => {
    mockRepository.deleteAll.mockResolvedValue(0);

    const result = await deleteAllMonthlyReportsUseCase.execute();

    expect(result.deleted).toBe(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.deleteAll.mockRejectedValue(error);

    await expect(deleteAllMonthlyReportsUseCase.execute()).rejects.toThrow('Database error');
  });
});
