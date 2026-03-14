import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateModuleUseCase } from '@module-registry/application/use-cases/update-module.use-case';
import type { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleNotFoundError } from '@module-registry/domain/errors/module-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
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

    const existingModule = ModuleFactory.create({ id: 1 });
    const expectedModule = ModuleFactory.create({
      id: 1,
      sourceValue: 'Updated Source',
      displayValue: 'Updated Display',
      application: 'FF',
      isActive: false,
    });

    mockRepository.findById.mockResolvedValue(existingModule);
    mockRepository.update.mockResolvedValue(expectedModule);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
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

    const existingModule = ModuleFactory.create({ id: 1 });
    const expectedModule = ModuleFactory.create({
      id: 1,
      displayValue: 'New Display Value',
    });

    mockRepository.findById.mockResolvedValue(existingModule);
    mockRepository.update.mockResolvedValue(expectedModule);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.displayValue).toBe('New Display Value');
  });

  it('should return ModuleNotFoundError when module not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999, { displayValue: 'Updated' });

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(ModuleNotFoundError);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
