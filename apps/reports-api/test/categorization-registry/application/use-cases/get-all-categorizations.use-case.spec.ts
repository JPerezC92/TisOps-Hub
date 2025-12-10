import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllCategorizationsUseCase } from '@categorization-registry/application/use-cases/get-all-categorizations.use-case';
import type { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationFactory } from '../../helpers/categorization-registry.factory';

describe('GetAllCategorizationsUseCase', () => {
  let useCase: GetAllCategorizationsUseCase;
  let mockRepository: MockProxy<ICategorizationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICategorizationRegistryRepository>();
    useCase = new GetAllCategorizationsUseCase(mockRepository);
  });

  it('should return all categorizations', async () => {
    const expectedCategorizations = CategorizationFactory.createMany(3);

    mockRepository.findAll.mockResolvedValue(expectedCategorizations);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedCategorizations);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no categorizations exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
