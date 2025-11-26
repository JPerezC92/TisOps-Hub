import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GetApplicationByIdUseCase } from '@application-registry/application/use-cases/get-application-by-id.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('GetApplicationByIdUseCase', () => {
  let useCase: GetApplicationByIdUseCase;
  let mockRepository: IApplicationRegistryRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByPattern: vi.fn(),
      findAllWithPatterns: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      createPattern: vi.fn(),
      deletePattern: vi.fn(),
    };

    useCase = new GetApplicationByIdUseCase(mockRepository);
  });

  it('should return application when found', async () => {
    const expectedApplication = ApplicationFactory.create({ id: 1 });

    vi.spyOn(mockRepository, 'findById').mockResolvedValue(expectedApplication);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedApplication);
  });

  it('should throw NotFoundException when application not found', async () => {
    vi.spyOn(mockRepository, 'findById').mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(999)).rejects.toThrow('Application with ID 999 not found');

    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
