import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAllApplicationsUseCase } from '@application-registry/application/use-cases/get-all-applications.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('GetAllApplicationsUseCase', () => {
  let useCase: GetAllApplicationsUseCase;
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

    useCase = new GetAllApplicationsUseCase(mockRepository);
  });

  it('should return all applications from repository', async () => {
    const expectedApplications = ApplicationFactory.createMany(3);

    vi.spyOn(mockRepository, 'findAll').mockResolvedValue(expectedApplications);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedApplications);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no applications exist', async () => {
    vi.spyOn(mockRepository, 'findAll').mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
