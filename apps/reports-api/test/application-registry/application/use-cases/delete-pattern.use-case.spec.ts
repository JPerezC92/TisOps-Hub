import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeletePatternUseCase } from '@application-registry/application/use-cases/delete-pattern.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';

describe('DeletePatternUseCase', () => {
  let useCase: DeletePatternUseCase;
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

    useCase = new DeletePatternUseCase(mockRepository);
  });

  it('should delete pattern successfully', async () => {
    vi.spyOn(mockRepository, 'deletePattern').mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.deletePattern).toHaveBeenCalledWith(1);
    expect(mockRepository.deletePattern).toHaveBeenCalledOnce();
  });

  it('should call repository deletePattern with correct id', async () => {
    vi.spyOn(mockRepository, 'deletePattern').mockResolvedValue(undefined);

    await useCase.execute(99);

    expect(mockRepository.deletePattern).toHaveBeenCalledWith(99);
  });
});
