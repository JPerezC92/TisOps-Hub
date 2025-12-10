import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateApplicationUseCase } from '@application-registry/application/use-cases/update-application.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
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

    const expectedApplication = ApplicationFactory.create({
      id: 1,
      name: 'Updated Application',
      isActive: false,
    });

    mockRepository.update.mockResolvedValue(expectedApplication);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result).toEqual(expectedApplication);
    expect(result.name).toBe('Updated Application');
    expect(result.isActive).toBe(false);
  });

  it('should update only provided fields', async () => {
    const updateData = {
      description: 'New Description',
    };

    const expectedApplication = ApplicationFactory.create({
      id: 1,
      description: 'New Description',
    });

    mockRepository.update.mockResolvedValue(expectedApplication);

    const result = await useCase.execute(1, updateData);

    expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.description).toBe('New Description');
  });
});
