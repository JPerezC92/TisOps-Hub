import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteModuleUseCase } from '@module-registry/application/use-cases/delete-module.use-case';
import type { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleNotFoundError } from '@module-registry/domain/errors/module-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ModuleFactory } from '../../helpers/module-registry.factory';

describe('DeleteModuleUseCase', () => {
  let useCase: DeleteModuleUseCase;
  let mockRepository: MockProxy<IModuleRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IModuleRegistryRepository>();
    useCase = new DeleteModuleUseCase(mockRepository);
  });

  it('should delete module successfully', async () => {
    const existingModule = ModuleFactory.create({ id: 1 });
    mockRepository.findById.mockResolvedValue(existingModule);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledOnce();
  });

  it('should call repository delete with correct id', async () => {
    const existingModule = ModuleFactory.create({ id: 42 });
    mockRepository.findById.mockResolvedValue(existingModule);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(42);

    expect(mockRepository.delete).toHaveBeenCalledWith(42);
  });

  it('should return ModuleNotFoundError when module not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(ModuleNotFoundError);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
