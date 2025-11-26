import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteApplicationUseCase } from '@application-registry/application/use-cases/delete-application.use-case';
import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';

describe('DeleteApplicationUseCase', () => {
  let useCase: DeleteApplicationUseCase;
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

    useCase = new DeleteApplicationUseCase(mockRepository);
  });

  it('should soft delete application successfully', async () => {
    vi.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledOnce();
  });

  it('should call repository delete with correct id', async () => {
    vi.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

    await useCase.execute(42);

    expect(mockRepository.delete).toHaveBeenCalledWith(42);
  });
});
