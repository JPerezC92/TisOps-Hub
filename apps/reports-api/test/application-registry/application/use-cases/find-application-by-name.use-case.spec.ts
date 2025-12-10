import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { FindApplicationByNameUseCase } from '@application-registry/application/use-cases/find-application-by-name.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('FindApplicationByNameUseCase', () => {
  let useCase: FindApplicationByNameUseCase;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IApplicationRegistryRepository>();
    useCase = new FindApplicationByNameUseCase(mockRepository);
  });

  it('should return application when pattern matches', async () => {
    const expectedApplication = ApplicationFactory.create({ name: 'Test Application' });

    mockRepository.findByPattern.mockResolvedValue(expectedApplication);

    const result = await useCase.execute('Test Application');

    expect(mockRepository.findByPattern).toHaveBeenCalledWith('Test Application');
    expect(result).toEqual(expectedApplication);
  });

  it('should return null when no pattern matches', async () => {
    mockRepository.findByPattern.mockResolvedValue(null);

    const result = await useCase.execute('NonExistent Application');

    expect(mockRepository.findByPattern).toHaveBeenCalledWith('NonExistent Application');
    expect(result).toBeNull();
  });
});
