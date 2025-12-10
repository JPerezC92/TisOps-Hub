import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeletePatternUseCase } from '@application-registry/application/use-cases/delete-pattern.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';

describe('DeletePatternUseCase', () => {
  let useCase: DeletePatternUseCase;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IApplicationRegistryRepository>();
    useCase = new DeletePatternUseCase(mockRepository);
  });

  it('should delete pattern successfully', async () => {
    mockRepository.deletePattern.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.deletePattern).toHaveBeenCalledWith(1);
    expect(mockRepository.deletePattern).toHaveBeenCalledOnce();
  });

  it('should call repository deletePattern with correct id', async () => {
    mockRepository.deletePattern.mockResolvedValue(undefined);

    await useCase.execute(99);

    expect(mockRepository.deletePattern).toHaveBeenCalledWith(99);
  });
});
