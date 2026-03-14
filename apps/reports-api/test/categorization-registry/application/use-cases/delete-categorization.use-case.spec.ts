import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteCategorizationUseCase } from '@categorization-registry/application/use-cases/delete-categorization.use-case';
import type { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationNotFoundError } from '@categorization-registry/domain/errors/categorization-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { CategorizationFactory } from '../../helpers/categorization-registry.factory';

describe('DeleteCategorizationUseCase', () => {
  let useCase: DeleteCategorizationUseCase;
  let mockRepository: MockProxy<ICategorizationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICategorizationRegistryRepository>();
    useCase = new DeleteCategorizationUseCase(mockRepository);
  });

  it('should delete categorization successfully', async () => {
    const existingCategorization = CategorizationFactory.create({ id: 1 });
    mockRepository.findById.mockResolvedValue(existingCategorization);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledOnce();
  });

  it('should call repository delete with correct id', async () => {
    const existingCategorization = CategorizationFactory.create({ id: 42 });
    mockRepository.findById.mockResolvedValue(existingCategorization);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(42);

    expect(mockRepository.delete).toHaveBeenCalledWith(42);
  });

  it('should return CategorizationNotFoundError when categorization not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(CategorizationNotFoundError);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
