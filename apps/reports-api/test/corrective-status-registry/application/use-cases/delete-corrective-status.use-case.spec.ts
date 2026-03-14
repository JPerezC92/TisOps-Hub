import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/delete-corrective-status.use-case';
import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusNotFoundError } from '@corrective-status-registry/domain/errors/corrective-status-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { CorrectiveStatusFactory } from '../../helpers/corrective-status.factory';

describe('DeleteCorrectiveStatusUseCase', () => {
  let useCase: DeleteCorrectiveStatusUseCase;
  let mockRepository: MockProxy<ICorrectiveStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICorrectiveStatusRegistryRepository>();
    useCase = new DeleteCorrectiveStatusUseCase(mockRepository);
  });

  it('should delete corrective status successfully', async () => {
    const existingStatus = CorrectiveStatusFactory.create({ id: 1 });
    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledOnce();
  });

  it('should call repository delete with correct id', async () => {
    const existingStatus = CorrectiveStatusFactory.create({ id: 42 });
    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(42);

    expect(mockRepository.delete).toHaveBeenCalledWith(42);
  });

  it('should return CorrectiveStatusNotFoundError when status not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(CorrectiveStatusNotFoundError);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
