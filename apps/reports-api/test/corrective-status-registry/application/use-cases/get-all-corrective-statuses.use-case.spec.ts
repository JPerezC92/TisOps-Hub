import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllCorrectiveStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-all-corrective-statuses.use-case';
import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusFactory } from '../../helpers/corrective-status.factory';

describe('GetAllCorrectiveStatusesUseCase', () => {
  let useCase: GetAllCorrectiveStatusesUseCase;
  let mockRepository: MockProxy<ICorrectiveStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICorrectiveStatusRegistryRepository>();
    useCase = new GetAllCorrectiveStatusesUseCase(mockRepository);
  });

  it('should return all corrective statuses', async () => {
    const expectedStatuses = CorrectiveStatusFactory.createMany(5);

    mockRepository.findAll.mockResolvedValue(expectedStatuses);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedStatuses);
    expect(result).toHaveLength(5);
  });

  it('should return empty array when no statuses exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
