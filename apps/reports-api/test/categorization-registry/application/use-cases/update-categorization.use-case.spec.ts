import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateCategorizationUseCase } from '@categorization-registry/application/use-cases/update-categorization.use-case';
import type { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationFactory } from '../../helpers/categorization-registry.factory';

describe('UpdateCategorizationUseCase', () => {
  let useCase: UpdateCategorizationUseCase;
  let mockRepository: MockProxy<ICategorizationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICategorizationRegistryRepository>();
    useCase = new UpdateCategorizationUseCase(mockRepository);
  });

  it('should update categorization successfully', async () => {
    const updateData = {
      sourceValue: 'Updated Source',
      displayValue: 'Updated Display',
      isActive: false,
    };

    const expectedCategorization = CategorizationFactory.create({
      id: 1,
      sourceValue: 'Updated Source',
      displayValue: 'Updated Display',
      isActive: false,
    });

    mockRepository.update.mockResolvedValue(expectedCategorization);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toEqual(expectedCategorization);
    expect(result.sourceValue).toBe('Updated Source');
    expect(result.displayValue).toBe('Updated Display');
    expect(result.isActive).toBe(false);
  });

  it('should update only provided fields (partial update)', async () => {
    const updateData = {
      displayValue: 'New Display Value',
    };

    const expectedCategorization = CategorizationFactory.create({
      id: 1,
      displayValue: 'New Display Value',
    });

    mockRepository.update.mockResolvedValue(expectedCategorization);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.displayValue).toBe('New Display Value');
  });
});
