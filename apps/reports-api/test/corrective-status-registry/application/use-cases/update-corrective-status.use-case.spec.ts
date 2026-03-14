import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpdateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/update-corrective-status.use-case';
import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusNotFoundError } from '@corrective-status-registry/domain/errors/corrective-status-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { CorrectiveStatusFactory } from '../../helpers/corrective-status.factory';

describe('UpdateCorrectiveStatusUseCase', () => {
  let useCase: UpdateCorrectiveStatusUseCase;
  let mockRepository: MockProxy<ICorrectiveStatusRegistryRepository>;

  beforeEach(() => {
    mockRepository = mock<ICorrectiveStatusRegistryRepository>();
    useCase = new UpdateCorrectiveStatusUseCase(mockRepository);
  });

  it('should update corrective status successfully', async () => {
    const updateDto = {
      displayStatus: 'Updated Display Status',
    };
    const existingStatus = CorrectiveStatusFactory.create({ id: 1 });
    const expectedStatus = CorrectiveStatusFactory.create({
      id: 1,
      displayStatus: updateDto.displayStatus,
    });

    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.update.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(1, updateDto);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
    expect(result).toEqual(expectedStatus);
    expect(result.displayStatus).toBe(updateDto.displayStatus);
  });

  it('should update multiple fields at once', async () => {
    const updateDto = {
      rawStatus: 'New Raw Status',
      displayStatus: 'New Display Status',
      isActive: false,
    };
    const existingStatus = CorrectiveStatusFactory.create({ id: 2 });
    const expectedStatus = CorrectiveStatusFactory.create({
      id: 2,
      rawStatus: updateDto.rawStatus,
      displayStatus: updateDto.displayStatus,
      isActive: updateDto.isActive,
    });

    mockRepository.findById.mockResolvedValue(existingStatus);
    mockRepository.update.mockResolvedValue(expectedStatus);

    const result = await useCase.execute(2, updateDto);

    expect(mockRepository.update).toHaveBeenCalledWith(2, updateDto);
    expect(result.rawStatus).toBe(updateDto.rawStatus);
    expect(result.displayStatus).toBe(updateDto.displayStatus);
    expect(result.isActive).toBe(updateDto.isActive);
  });

  it('should return CorrectiveStatusNotFoundError when status not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999, { displayStatus: 'Updated' });

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(CorrectiveStatusNotFoundError);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
