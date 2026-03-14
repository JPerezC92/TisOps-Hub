import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteApplicationUseCase } from '@application-registry/application/use-cases/delete-application.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationNotFoundError } from '@application-registry/domain/errors/application-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('DeleteApplicationUseCase', () => {
  let useCase: DeleteApplicationUseCase;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IApplicationRegistryRepository>();
    useCase = new DeleteApplicationUseCase(mockRepository);
  });

  it('should soft delete application successfully', async () => {
    const existingApplication = ApplicationFactory.create({ id: 1 });
    mockRepository.findById.mockResolvedValue(existingApplication);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledOnce();
  });

  it('should call repository delete with correct id', async () => {
    const existingApplication = ApplicationFactory.create({ id: 42 });
    mockRepository.findById.mockResolvedValue(existingApplication);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(42);

    expect(mockRepository.delete).toHaveBeenCalledWith(42);
  });

  it('should return ApplicationNotFoundError when application not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(ApplicationNotFoundError);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
