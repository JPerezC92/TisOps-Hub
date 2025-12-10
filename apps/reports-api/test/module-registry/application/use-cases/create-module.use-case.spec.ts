import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CreateModuleUseCase } from '@module-registry/application/use-cases/create-module.use-case';
import type { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleFactory } from '../../helpers/module-registry.factory';

describe('CreateModuleUseCase', () => {
  let useCase: CreateModuleUseCase;
  let mockRepository: MockProxy<IModuleRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IModuleRegistryRepository>();
    useCase = new CreateModuleUseCase(mockRepository);
  });

  it('should create module with all fields', async () => {
    const moduleData = {
      sourceValue: 'SB2 Pase de Pedidos',
      displayValue: 'Order Placement',
      application: 'SB',
      isActive: true,
    };

    const expectedModule = ModuleFactory.create({
      id: 1,
      sourceValue: 'SB2 Pase de Pedidos',
      displayValue: 'Order Placement',
      application: 'SB',
      isActive: true,
    });

    mockRepository.create.mockResolvedValue(expectedModule);

    const result = await useCase.execute(moduleData);

    expect(mockRepository.create).toHaveBeenCalledWith(moduleData);
    expect(result).toEqual(expectedModule);
  });

  it('should create module with minimal fields (isActive defaults to true)', async () => {
    const moduleData = {
      sourceValue: 'SB2 Reserva de Pedidos',
      displayValue: 'Order Reservation',
      application: 'SB',
    };

    const expectedModule = ModuleFactory.create({
      id: 1,
      sourceValue: 'SB2 Reserva de Pedidos',
      displayValue: 'Order Reservation',
      application: 'SB',
      isActive: true,
    });

    mockRepository.create.mockResolvedValue(expectedModule);

    const result = await useCase.execute(moduleData);

    expect(mockRepository.create).toHaveBeenCalledWith(moduleData);
    expect(result).toEqual(expectedModule);
  });
});
