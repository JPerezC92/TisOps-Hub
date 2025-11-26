import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindApplicationByNameUseCase } from '@application-registry/application/use-cases/find-application-by-name.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('FindApplicationByNameUseCase', () => {
  let useCase: FindApplicationByNameUseCase;
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

    useCase = new FindApplicationByNameUseCase(mockRepository);
  });

  it('should return application when pattern matches', async () => {
    const expectedApplication = ApplicationFactory.create({ name: 'Test Application' });

    vi.spyOn(mockRepository, 'findByPattern').mockResolvedValue(expectedApplication);

    const result = await useCase.execute('Test Application');

    expect(mockRepository.findByPattern).toHaveBeenCalledWith('Test Application');
    expect(result).toEqual(expectedApplication);
  });

  it('should return null when no pattern matches', async () => {
    vi.spyOn(mockRepository, 'findByPattern').mockResolvedValue(null);

    const result = await useCase.execute('NonExistent Application');

    expect(mockRepository.findByPattern).toHaveBeenCalledWith('NonExistent Application');
    expect(result).toBeNull();
  });
});
