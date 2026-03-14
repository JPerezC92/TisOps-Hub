import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetCorrectiveStatusByIdUseCase } from '@corrective-status-registry/application/use-cases/get-corrective-status-by-id.use-case';
import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusNotFoundError } from '@corrective-status-registry/domain/errors/corrective-status-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
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

  it('should return CorrectiveStatusNotFoundError when status not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(CorrectiveStatusNotFoundError);
    expect((result as CorrectiveStatusNotFoundError).message).toBe('Corrective status with ID 999 not found');
    expect(mockRepository.findById).toHaveBeenCalledWith(999);
  });
});
