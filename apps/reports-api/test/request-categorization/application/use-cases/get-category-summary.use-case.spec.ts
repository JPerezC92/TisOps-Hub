import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetCategorySummaryUseCase } from '@request-categorization/application/use-cases/get-category-summary.use-case';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';

describe('GetCategorySummaryUseCase', () => {
  let getCategorySummaryUseCase: GetCategorySummaryUseCase;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestCategorizationRepository>();
    getCategorySummaryUseCase = new GetCategorySummaryUseCase(mockRepository);
  });

  it('should return category summary with counts', async () => {
    const expectedSummary = [
      { category: 'Incident', count: 150 },
      { category: 'Service Request', count: 75 },
      { category: 'Change', count: 30 },
    ];

    mockRepository.getCategorySummary.mockResolvedValue(expectedSummary);

    const result = await getCategorySummaryUseCase.execute();

    expect(mockRepository.getCategorySummary).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedSummary);
  });

  it('should return empty array when no categories exist', async () => {
    mockRepository.getCategorySummary.mockResolvedValue([]);

    const result = await getCategorySummaryUseCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.getCategorySummary.mockRejectedValue(error);

    await expect(getCategorySummaryUseCase.execute()).rejects.toThrow(
      'Database error',
    );
  });

  it('should return summary with single category', async () => {
    const expectedSummary = [{ category: 'Incident', count: 100 }];

    mockRepository.getCategorySummary.mockResolvedValue(expectedSummary);

    const result = await getCategorySummaryUseCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Incident');
    expect(result[0].count).toBe(100);
  });
});
