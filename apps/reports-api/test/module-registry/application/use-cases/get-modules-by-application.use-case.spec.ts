import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetModulesByApplicationUseCase } from '@module-registry/application/use-cases/get-modules-by-application.use-case';
import type { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleFactory } from '../../helpers/module-registry.factory';

describe('GetModulesByApplicationUseCase', () => {
  let useCase: GetModulesByApplicationUseCase;
  let mockRepository: MockProxy<IModuleRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IModuleRegistryRepository>();
    useCase = new GetModulesByApplicationUseCase(mockRepository);
  });

  it('should return modules for a specific application', async () => {
    const sbModules = ModuleFactory.createMany(3, { application: 'SB' });

    mockRepository.findByApplication.mockResolvedValue(sbModules);

    const result = await useCase.execute('SB');

    expect(mockRepository.findByApplication).toHaveBeenCalledWith('SB');
    expect(result).toEqual(sbModules);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no modules for application', async () => {
    mockRepository.findByApplication.mockResolvedValue([]);

    const result = await useCase.execute('UNKNOWN');

    expect(mockRepository.findByApplication).toHaveBeenCalledWith('UNKNOWN');
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should call repository with correct application code', async () => {
    const ffModules = ModuleFactory.createMany(2, { application: 'FF' });

    mockRepository.findByApplication.mockResolvedValue(ffModules);

    const result = await useCase.execute('FF');

    expect(mockRepository.findByApplication).toHaveBeenCalledWith('FF');
    expect(result.every((m) => m.application === 'FF')).toBe(true);
  });
});
