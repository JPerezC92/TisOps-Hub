import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { NotFoundException } from '@nestjs/common';
import { GetCorrectiveStatusByIdUseCase } from '@corrective-status-registry/application/use-cases/get-corrective-status-by-id.use-case';
import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusFactory } from '../../helpers/corrective-status.factory';

describe('GetCorrectiveStatusByIdUseCase', () => {
  let useCase: GetCorrectiveStatusByIdUseCase;
  let mockRepository: MockProxy<ICorrectiveStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICorrectiveStatusRegistryRepository>();
    useCase = new GetCorrectiveStatusByIdUseCase(mockRepository);
  });

  it('should return corrective status when found', async () => {
    const expectedStatus = CorrectiveStatusFactory.create({ id: 1 });

    mockRepository.findById.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedStatus);
  });

  it('should throw NotFoundException when status not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(999)).rejects.toThrow('Corrective status with ID 999 not found');

    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
