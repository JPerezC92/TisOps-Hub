import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetApplicationByIdUseCase } from '@application-registry/application/use-cases/get-application-by-id.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationNotFoundError } from '@application-registry/domain/errors/application-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('GetApplicationByIdUseCase', () => {
  let useCase: GetApplicationByIdUseCase;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IApplicationRegistryRepository>();
    useCase = new GetApplicationByIdUseCase(mockRepository);
  });

  it('should return application when found', async () => {
    const expectedApplication = ApplicationFactory.create({ id: 1 });

    mockRepository.findById.mockResolvedValue(expectedApplication);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedApplication);
  });

  it('should return ApplicationNotFoundError when application not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(ApplicationNotFoundError);
    expect((result as ApplicationNotFoundError).message).toBe('Application with ID 999 not found');
    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
