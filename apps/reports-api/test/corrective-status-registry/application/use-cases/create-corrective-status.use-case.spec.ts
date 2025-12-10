import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CreateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/create-corrective-status.use-case';
import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusFactory } from '../../helpers/corrective-status.factory';

describe('CreateCorrectiveStatusUseCase', () => {
  let useCase: CreateCorrectiveStatusUseCase;
  let mockRepository: MockProxy<ICorrectiveStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICorrectiveStatusRegistryRepository>();
    useCase = new CreateCorrectiveStatusUseCase(mockRepository);
  });

  it('should create a corrective status successfully', async () => {
    const createDto = {
      rawStatus: 'Dev in Progress',
      displayStatus: 'Development in Progress',
    };
    const expectedStatus = CorrectiveStatusFactory.create({
      rawStatus: createDto.rawStatus,
      displayStatus: createDto.displayStatus,
    });

    mockRepository.create.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(createDto);

    expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(expectedStatus);
    expect(result.rawStatus).toBe(createDto.rawStatus);
    expect(result.displayStatus).toBe(createDto.displayStatus);
  });

  it('should create a corrective status with isActive flag', async () => {
    const createDto = {
      rawStatus: 'In Testing',
      displayStatus: 'In Testing',
      isActive: true,
    };
    const expectedStatus = CorrectiveStatusFactory.create({
      rawStatus: createDto.rawStatus,
      displayStatus: createDto.displayStatus,
      isActive: true,
    });

    mockRepository.create.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(createDto);

    expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    expect(result.isActive).toBe(true);
  });
});
