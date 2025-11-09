import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetChildrenByParentUseCase } from '@parent-child-requests/application/use-cases/get-children-by-parent.use-case';
import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { ParentChildRequestFactory } from '../../helpers/parent-child-request.factory';

describe('GetChildrenByParentUseCase', () => {
  let getChildrenByParentUseCase: GetChildrenByParentUseCase;
  let mockRepository: MockProxy<IParentChildRequestRepository>;

  beforeEach(() => {
    mockRepository = mock<IParentChildRequestRepository>();
    getChildrenByParentUseCase = new GetChildrenByParentUseCase(mockRepository);
  });

  it('should return all children for a given parent', async () => {
    const parentId = 'REQ001';
    const expectedChildren = ParentChildRequestFactory.createMany(3, {
      requestId: parentId,
    });

    mockRepository.findByParentId.mockResolvedValue(expectedChildren);

    const result = await getChildrenByParentUseCase.execute(parentId);

    expect(mockRepository.findByParentId).toHaveBeenCalledWith(parentId);
    expect(mockRepository.findByParentId).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedChildren);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when parent has no children', async () => {
    const parentId = 'REQ999';

    mockRepository.findByParentId.mockResolvedValue([]);

    const result = await getChildrenByParentUseCase.execute(parentId);

    expect(mockRepository.findByParentId).toHaveBeenCalledWith(parentId);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const parentId = 'REQ001';
    const error = new Error('Database error');

    mockRepository.findByParentId.mockRejectedValue(error);

    await expect(getChildrenByParentUseCase.execute(parentId)).rejects.toThrow(
      'Database error',
    );
  });

  it('should return children with different linked requests', async () => {
    const parentId = 'REQ001';
    const expectedChildren = [
      ParentChildRequestFactory.create({
        requestId: parentId,
        linkedRequestId: 'REQ002',
      }),
      ParentChildRequestFactory.create({
        requestId: parentId,
        linkedRequestId: 'REQ003',
      }),
      ParentChildRequestFactory.create({
        requestId: parentId,
        linkedRequestId: 'REQ004',
      }),
    ];

    mockRepository.findByParentId.mockResolvedValue(expectedChildren);

    const result = await getChildrenByParentUseCase.execute(parentId);

    expect(result).toHaveLength(3);
    expect(result[0].requestId).toBe(parentId);
    expect(result[1].requestId).toBe(parentId);
    expect(result[2].requestId).toBe(parentId);
  });
});
