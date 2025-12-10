import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetDistinctDisplayStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-distinct-display-statuses.use-case';
import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';

describe('GetDistinctDisplayStatusesUseCase', () => {
  let useCase: GetDistinctDisplayStatusesUseCase;
  let mockRepository: MockProxy<ICorrectiveStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICorrectiveStatusRegistryRepository>();
    useCase = new GetDistinctDisplayStatusesUseCase(mockRepository);
  });

  it('should return distinct display statuses', async () => {
    const expectedStatuses = [
      'Development in Progress',
      'In Backlog',
      'In Testing',
      'Production Deployment',
    ];

    mockRepository.findDistinctDisplayStatuses.mockResolvedValue(expectedStatuses);

    const result = await useCase.execute();

    expect(mockRepository.findDistinctDisplayStatuses).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedStatuses);
    expect(result).toHaveLength(4);
  });

  it('should return empty array when no display statuses exist', async () => {
    mockRepository.findDistinctDisplayStatuses.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findDistinctDisplayStatuses).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
