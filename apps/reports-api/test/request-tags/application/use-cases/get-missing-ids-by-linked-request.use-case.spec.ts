import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetMissingIdsByLinkedRequestUseCase } from '@request-tags/application/use-cases/get-missing-ids-by-linked-request.use-case';
import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

describe('GetMissingIdsByLinkedRequestUseCase', () => {
  let getMissingIdsUseCase: GetMissingIdsByLinkedRequestUseCase;
  let mockRepository: MockProxy<IRequestTagRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestTagRepository>();
    getMissingIdsUseCase = new GetMissingIdsByLinkedRequestUseCase(
      mockRepository,
    );
  });

  it('should return missing request IDs for linked request', async () => {
    const linkedRequestId = 'REQ001';
    const expectedResult = [
      { requestId: 'REQ002', requestIdLink: 'https://example.com/REQ002' },
      { requestId: 'REQ003' },
    ];

    mockRepository.findMissingIdsByLinkedRequestId.mockResolvedValue(
      expectedResult,
    );

    const result = await getMissingIdsUseCase.execute(linkedRequestId);

    expect(
      mockRepository.findMissingIdsByLinkedRequestId,
    ).toHaveBeenCalledWith(linkedRequestId);
    expect(mockRepository.findMissingIdsByLinkedRequestId).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no missing IDs found', async () => {
    const linkedRequestId = 'REQ001';

    mockRepository.findMissingIdsByLinkedRequestId.mockResolvedValue([]);

    const result = await getMissingIdsUseCase.execute(linkedRequestId);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return empty array when linkedRequestId is empty string', async () => {
    const result = await getMissingIdsUseCase.execute('');

    expect(mockRepository.findMissingIdsByLinkedRequestId).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return empty array when linkedRequestId is whitespace', async () => {
    const result = await getMissingIdsUseCase.execute('   ');

    expect(mockRepository.findMissingIdsByLinkedRequestId).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should handle repository errors', async () => {
    const linkedRequestId = 'REQ001';
    const error = new Error('Database error');

    mockRepository.findMissingIdsByLinkedRequestId.mockRejectedValue(error);

    await expect(getMissingIdsUseCase.execute(linkedRequestId)).rejects.toThrow(
      'Database error',
    );
  });

  it('should return missing IDs without links', async () => {
    const linkedRequestId = 'REQ001';
    const expectedResult = [
      { requestId: 'REQ004' },
      { requestId: 'REQ005' },
      { requestId: 'REQ006' },
    ];

    mockRepository.findMissingIdsByLinkedRequestId.mockResolvedValue(
      expectedResult,
    );

    const result = await getMissingIdsUseCase.execute(linkedRequestId);

    expect(result).toHaveLength(3);
    expect(result[0].requestIdLink).toBeUndefined();
    expect(result[1].requestIdLink).toBeUndefined();
  });
});
