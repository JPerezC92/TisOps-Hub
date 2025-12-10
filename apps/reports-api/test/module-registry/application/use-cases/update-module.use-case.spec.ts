import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateModuleUseCase } from '@module-registry/application/use-cases/update-module.use-case';
import type { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleFactory } from '../../helpers/module-registry.factory';

describe('UpdateModuleUseCase', () => {
  let useCase: UpdateModuleUseCase;
  let mockRepository: MockProxy<IModuleRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IModuleRegistryRepository>();
    useCase = new UpdateModuleUseCase(mockRepository);
  });

  it('should update module successfully', async () => {
    const updateData = {
      sourceValue: 'Updated Source',
      displayValue: 'Updated Display',
      application: 'FF',
      isActive: false,
    };

    const expectedModule = ModuleFactory.create({
      id: 1,
      sourceValue: 'Updated Source',
      displayValue: 'Updated Display',
      application: 'FF',
      isActive: false,
    });

    mockRepository.update.mockResolvedValue(expectedModule);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toEqual(expectedModule);
    expect(result.sourceValue).toBe('Updated Source');
    expect(result.displayValue).toBe('Updated Display');
    expect(result.application).toBe('FF');
    expect(result.isActive).toBe(false);
  });

  it('should update only provided fields (partial update)', async () => {
    const updateData = {
      displayValue: 'New Display Value',
    };

    const expectedModule = ModuleFactory.create({
      id: 1,
      displayValue: 'New Display Value',
    });

    mockRepository.update.mockResolvedValue(expectedModule);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.displayValue).toBe('New Display Value');
  });
});
