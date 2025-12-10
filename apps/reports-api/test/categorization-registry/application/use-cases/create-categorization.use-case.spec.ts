import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CreateCategorizationUseCase } from '@categorization-registry/application/use-cases/create-categorization.use-case';
import type { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationFactory } from '../../helpers/categorization-registry.factory';

describe('CreateCategorizationUseCase', () => {
  let useCase: CreateCategorizationUseCase;
  let mockRepository: MockProxy<ICategorizationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICategorizationRegistryRepository>();
    useCase = new CreateCategorizationUseCase(mockRepository);
  });

  it('should create categorization with all fields', async () => {
    const categorizationData = {
      sourceValue: 'Error de codificación (Bug)',
      displayValue: 'Bugs',
      isActive: true,
    };

    const expectedCategorization = CategorizationFactory.create({
      id: 1,
      sourceValue: 'Error de codificación (Bug)',
      displayValue: 'Bugs',
      isActive: true,
    });

    mockRepository.create.mockResolvedValue(expectedCategorization);

    const result = await useCase.execute(categorizationData);

    expect(mockRepository.create).toHaveBeenCalledWith(categorizationData);
    expect(result).toEqual(expectedCategorization);
  });

  it('should create categorization with minimal fields (isActive defaults to true)', async () => {
    const categorizationData = {
      sourceValue: 'Error de datos (Data Source)',
      displayValue: 'Data Source',
    };

    const expectedCategorization = CategorizationFactory.create({
      id: 1,
      sourceValue: 'Error de datos (Data Source)',
      displayValue: 'Data Source',
      isActive: true,
    });

    mockRepository.create.mockResolvedValue(expectedCategorization);

    const result = await useCase.execute(categorizationData);

    expect(mockRepository.create).toHaveBeenCalledWith(categorizationData);
    expect(result).toEqual(expectedCategorization);
  });
});
