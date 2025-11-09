import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CreateManyParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/create-many.use-case';
import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { ParentChildRequestFactory } from '../../helpers/parent-child-request.factory';

describe('CreateManyParentChildRequestsUseCase', () => {
  let createManyUseCase: CreateManyParentChildRequestsUseCase;
  let mockRepository: MockProxy<IParentChildRequestRepository>;

  beforeEach(() => {
    mockRepository = mock<IParentChildRequestRepository>();
    createManyUseCase = new CreateManyParentChildRequestsUseCase(mockRepository);
  });

  it('should drop and recreate table before importing', async () => {
    const data = ParentChildRequestFactory.createManyData(1);

    mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);
    mockRepository.bulkCreate.mockResolvedValue(undefined);

    await createManyUseCase.execute(data);

    expect(mockRepository.dropAndRecreateTable).toHaveBeenCalledOnce();
  });

  it('should successfully import all records in a single batch', async () => {
    const data = ParentChildRequestFactory.createManyData(10);

    mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);
    mockRepository.bulkCreate.mockResolvedValue(undefined);

    const result = await createManyUseCase.execute(data);

    expect(mockRepository.bulkCreate).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreate).toHaveBeenCalledWith(data);
    expect(result).toEqual({ imported: 10, skipped: 0 });
  });

  it('should process records in batches of 500', async () => {
    const data = ParentChildRequestFactory.createManyData(1200);

    mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);
    mockRepository.bulkCreate.mockResolvedValue(undefined);

    const result = await createManyUseCase.execute(data);

    expect(mockRepository.bulkCreate).toHaveBeenCalledTimes(3); // 500 + 500 + 200
    expect(result).toEqual({ imported: 1200, skipped: 0 });
  });

  it('should fallback to individual inserts when batch fails', async () => {
    const data = ParentChildRequestFactory.createManyData(3);

    mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);
    mockRepository.bulkCreate.mockRejectedValue(
      new Error('Batch insert failed'),
    );
    mockRepository.createOne.mockResolvedValue({
      id: 1,
      requestId: data[0].requestId,
      linkedRequestId: data[0].linkedRequestId,
      requestIdLink: null,
      linkedRequestIdLink: null,
    } as any);

    const result = await createManyUseCase.execute(data);

    expect(mockRepository.bulkCreate).toHaveBeenCalledOnce();
    expect(mockRepository.createOne).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ imported: 3, skipped: 0 });
  });

  it('should skip records that fail individual insert', async () => {
    const data = ParentChildRequestFactory.createManyData(3);

    mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);
    mockRepository.bulkCreate.mockRejectedValue(
      new Error('Batch insert failed'),
    );

    // First record succeeds, second fails, third succeeds
    mockRepository.createOne
      .mockResolvedValueOnce({
        id: 1,
        requestId: data[0].requestId,
        linkedRequestId: data[0].linkedRequestId,
        requestIdLink: null,
        linkedRequestIdLink: null,
      } as any)
      .mockRejectedValueOnce(new Error('Duplicate entry'))
      .mockResolvedValueOnce({
        id: 3,
        requestId: data[2].requestId,
        linkedRequestId: data[2].linkedRequestId,
        requestIdLink: null,
        linkedRequestIdLink: null,
      } as any);

    const result = await createManyUseCase.execute(data);

    expect(result).toEqual({ imported: 2, skipped: 1 });
  });

  it('should handle empty data array', async () => {
    mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);

    const result = await createManyUseCase.execute([]);

    expect(mockRepository.dropAndRecreateTable).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreate).not.toHaveBeenCalled();
    expect(result).toEqual({ imported: 0, skipped: 0 });
  });

  it('should handle records with optional links', async () => {
    const data = ParentChildRequestFactory.createManyData(3);

    mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);
    mockRepository.bulkCreate.mockResolvedValue(undefined);

    const result = await createManyUseCase.execute(data);

    expect(mockRepository.bulkCreate).toHaveBeenCalledWith(data);
    expect(result).toEqual({ imported: 3, skipped: 0 });
  });
});
