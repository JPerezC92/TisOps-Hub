import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetApplicationsWithPatternsUseCase } from '@application-registry/application/use-cases/get-applications-with-patterns.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationWithPatternsFactory } from '../../helpers/application-registry.factory';

describe('GetApplicationsWithPatternsUseCase', () => {
  let useCase: GetApplicationsWithPatternsUseCase;
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

    useCase = new GetApplicationsWithPatternsUseCase(mockRepository);
  });

  it('should return applications with their patterns', async () => {
    const expectedApplications = ApplicationWithPatternsFactory.createMany(2);

    vi.spyOn(mockRepository, 'findAllWithPatterns').mockResolvedValue(expectedApplications);

    const result = await useCase.execute();

    expect(mockRepository.findAllWithPatterns).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedApplications);
    expect(result).toHaveLength(2);
    expect(result[0].patterns).toBeDefined();
    expect(result[1].patterns).toBeDefined();
  });

  it('should return empty array when no applications exist', async () => {
    vi.spyOn(mockRepository, 'findAllWithPatterns').mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAllWithPatterns).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
