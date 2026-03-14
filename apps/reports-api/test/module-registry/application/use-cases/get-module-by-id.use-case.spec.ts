import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetModuleByIdUseCase } from '@module-registry/application/use-cases/get-module-by-id.use-case';
import type { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleNotFoundError } from '@module-registry/domain/errors/module-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ModuleFactory } from '../../helpers/module-registry.factory';

describe('GetModuleByIdUseCase', () => {
  let useCase: GetModuleByIdUseCase;
  let mockRepository: MockProxy<IModuleRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IModuleRegistryRepository>();
    useCase = new GetModuleByIdUseCase(mockRepository);
  });

  it('should return module when found', async () => {
    const expectedModule = ModuleFactory.create({ id: 1 });

    mockRepository.findById.mockResolvedValue(expectedModule);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedModule);
  });

  it('should return ModuleNotFoundError when module not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(ModuleNotFoundError);
    expect((result as ModuleNotFoundError).message).toBe('Module with ID 999 not found');
    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
