import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateApplicationUseCase } from '@application-registry/application/use-cases/create-application.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('CreateApplicationUseCase', () => {
  let useCase: CreateApplicationUseCase;
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

    useCase = new CreateApplicationUseCase(mockRepository);
  });

  it('should create application with all fields', async () => {
    const applicationData = {
      code: 'TEST',
      name: 'Test Application',
      description: 'Test Description',
      isActive: true,
    };

    const expectedApplication = ApplicationFactory.create({
      id: 1,
      code: 'TEST',
      name: 'Test Application',
      description: 'Test Description',
      isActive: true,
    });

    vi.spyOn(mockRepository, 'create').mockResolvedValue(expectedApplication);

    const result = await useCase.execute(applicationData);

    expect(mockRepository.create).toHaveBeenCalledWith(applicationData);
    expect(result).toEqual(expectedApplication);
  });

  it('should create application with minimal fields (defaults applied)', async () => {
    const applicationData = {
      code: 'MIN',
      name: 'Minimal Application',
    };

    const expectedApplication = ApplicationFactory.create({
      id: 1,
      code: 'MIN',
      name: 'Minimal Application',
      description: null,
      isActive: true,
    });

    vi.spyOn(mockRepository, 'create').mockResolvedValue(expectedApplication);

    const result = await useCase.execute(applicationData);

    expect(mockRepository.create).toHaveBeenCalledWith(applicationData);
    expect(result).toEqual(expectedApplication);
  });
});
