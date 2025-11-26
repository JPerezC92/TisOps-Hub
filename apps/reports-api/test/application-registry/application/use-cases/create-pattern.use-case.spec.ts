import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePatternUseCase } from '@application-registry/application/use-cases/create-pattern.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationPatternFactory } from '../../helpers/application-registry.factory';

describe('CreatePatternUseCase', () => {
  let useCase: CreatePatternUseCase;
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

    useCase = new CreatePatternUseCase(mockRepository);
  });

  it('should create pattern with all fields', async () => {
    const patternData = {
      applicationId: 1,
      pattern: 'test-pattern',
      priority: 5,
      matchType: 'exact',
      isActive: true,
    };

    const expectedPattern = ApplicationPatternFactory.create({
      id: 1,
      applicationId: 1,
      pattern: 'test-pattern',
      priority: 5,
      matchType: 'exact',
      isActive: true,
    });

    vi.spyOn(mockRepository, 'createPattern').mockResolvedValue(expectedPattern);

    const result = await useCase.execute(patternData);

    expect(mockRepository.createPattern).toHaveBeenCalledWith(patternData);
    expect(result).toEqual(expectedPattern);
  });

  it('should create pattern with default values', async () => {
    const patternData = {
      applicationId: 1,
      pattern: 'simple-pattern',
    };

    const expectedPattern = ApplicationPatternFactory.create({
      id: 1,
      applicationId: 1,
      pattern: 'simple-pattern',
      priority: 1,
      matchType: 'contains',
      isActive: true,
    });

    vi.spyOn(mockRepository, 'createPattern').mockResolvedValue(expectedPattern);

    const result = await useCase.execute(patternData);

    expect(mockRepository.createPattern).toHaveBeenCalledWith(patternData);
    expect(result).toEqual(expectedPattern);
  });
});
