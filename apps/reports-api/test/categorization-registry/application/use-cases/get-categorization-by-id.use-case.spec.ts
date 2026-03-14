import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetCategorizationByIdUseCase } from '@categorization-registry/application/use-cases/get-categorization-by-id.use-case';
import type { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationNotFoundError } from '@categorization-registry/domain/errors/categorization-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
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

  it('should return CategorizationNotFoundError when categorization not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(CategorizationNotFoundError);
    expect((result as CategorizationNotFoundError).message).toBe('Categorization with ID 999 not found');
    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
