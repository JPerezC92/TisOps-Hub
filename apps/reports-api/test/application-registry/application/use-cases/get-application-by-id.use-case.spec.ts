import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { NotFoundException } from '@nestjs/common';
import { GetApplicationByIdUseCase } from '@application-registry/application/use-cases/get-application-by-id.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('GetApplicationByIdUseCase', () => {
  let useCase: GetApplicationByIdUseCase;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IApplicationRegistryRepository>();
    useCase = new GetApplicationByIdUseCase(mockRepository);
  });

  it('should return application when found', async () => {
    const expectedApplication = ApplicationFactory.create({ id: 1 });

    mockRepository.findById.mockResolvedValue(expectedApplication);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedApplication);
  });

  it('should throw NotFoundException when application not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(999)).rejects.toThrow('Application with ID 999 not found');

    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
