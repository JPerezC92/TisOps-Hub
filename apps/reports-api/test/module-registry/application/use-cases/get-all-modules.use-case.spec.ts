import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllModulesUseCase } from '@module-registry/application/use-cases/get-all-modules.use-case';
import type { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleFactory } from '../../helpers/module-registry.factory';

describe('GetAllModulesUseCase', () => {
  let useCase: GetAllModulesUseCase;
  let mockRepository: MockProxy<IModuleRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IModuleRegistryRepository>();
    useCase = new GetAllModulesUseCase(mockRepository);
  });

  it('should return all modules', async () => {
    const expectedModules = ModuleFactory.createMany(3);

    mockRepository.findAll.mockResolvedValue(expectedModules);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedModules);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no modules exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
