import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllApplicationsUseCase } from '@application-registry/application/use-cases/get-all-applications.use-case';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationFactory } from '../../helpers/application-registry.factory';

describe('GetAllApplicationsUseCase', () => {
  let useCase: GetAllApplicationsUseCase;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<IApplicationRegistryRepository>();
    useCase = new GetAllApplicationsUseCase(mockRepository);
  });

  it('should return all applications from repository', async () => {
    const expectedApplications = ApplicationFactory.createMany(3);

    mockRepository.findAll.mockResolvedValue(expectedApplications);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedApplications);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no applications exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
