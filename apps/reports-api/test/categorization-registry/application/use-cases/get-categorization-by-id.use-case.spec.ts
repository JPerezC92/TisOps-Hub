import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetCategorizationByIdUseCase } from '@categorization-registry/application/use-cases/get-categorization-by-id.use-case';
import type { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationFactory } from '../../helpers/categorization-registry.factory';

describe('GetCategorizationByIdUseCase', () => {
  let useCase: GetCategorizationByIdUseCase;
  let mockRepository: MockProxy<ICategorizationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICategorizationRegistryRepository>();
    useCase = new GetCategorizationByIdUseCase(mockRepository);
  });

  it('should return categorization when found', async () => {
    const expectedCategorization = CategorizationFactory.create({ id: 1 });

    mockRepository.findById.mockResolvedValue(expectedCategorization);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedCategorization);
  });

  it('should return null when categorization not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(mockRepository.findById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });
});
