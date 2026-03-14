import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateApplicationUseCase } from '@application-registry/application/use-cases/update-application.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationNotFoundError } from '@application-registry/domain/errors/application-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('UpdateApplicationUseCase', () => {
  let useCase: UpdateApplicationUseCase;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IApplicationRegistryRepository>();
    useCase = new UpdateApplicationUseCase(mockRepository);
  });

  it('should update application successfully', async () => {
    const updateData = {
      name: 'Updated Application',
      isActive: false,
    };

    const existingApplication = ApplicationFactory.create({ id: 1 });
    const expectedApplication = ApplicationFactory.create({
      id: 1,
      name: 'Updated Application',
      isActive: false,
    });

    mockRepository.findById.mockResolvedValue(existingApplication);
    mockRepository.update.mockResolvedValue(expectedApplication);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toEqual(expectedApplication);
    expect(result.name).toBe('Updated Application');
    expect(result.isActive).toBe(false);
  });

  it('should update only provided fields', async () => {
    const updateData = {
      description: 'New Description',
    };

    const existingApplication = ApplicationFactory.create({ id: 1 });
    const expectedApplication = ApplicationFactory.create({
      id: 1,
      description: 'New Description',
    });

    mockRepository.findById.mockResolvedValue(existingApplication);
    mockRepository.update.mockResolvedValue(expectedApplication);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.description).toBe('New Description');
  });

  it('should return ApplicationNotFoundError when application not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999, { name: 'Updated' });

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(ApplicationNotFoundError);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
