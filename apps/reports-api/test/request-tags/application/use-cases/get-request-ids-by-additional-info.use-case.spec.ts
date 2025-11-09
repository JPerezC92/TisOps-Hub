import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetRequestIdsByAdditionalInfoUseCase } from '@request-tags/application/use-cases/get-request-ids-by-additional-info.use-case';
import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

describe('GetRequestIdsByAdditionalInfoUseCase', () => {
  let getRequestIdsUseCase: GetRequestIdsByAdditionalInfoUseCase;
  let mockRepository: MockProxy<IRequestTagRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestTagRepository>();
    getRequestIdsUseCase = new GetRequestIdsByAdditionalInfoUseCase(
      mockRepository,
    );
  });

  it('should return request IDs for valid additional info and linked request', async () => {
    const informacionAdicional = 'Asignado';
    const linkedRequestId = 'REQ001';
    const expectedResult = [
      { requestId: 'REQ002', requestIdLink: 'https://example.com/REQ002' },
      { requestId: 'REQ003', requestIdLink: 'https://example.com/REQ003' },
      { requestId: 'REQ004' },
    ];

    mockRepository.findRequestIdsByAdditionalInfo.mockResolvedValue(
      expectedResult,
    );

    const result = await getRequestIdsUseCase.execute(
      informacionAdicional,
      linkedRequestId,
    );

    expect(mockRepository.findRequestIdsByAdditionalInfo).toHaveBeenCalledWith(
      informacionAdicional,
      linkedRequestId,
    );
    expect(mockRepository.findRequestIdsByAdditionalInfo).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when informacionAdicional is empty string', async () => {
    const result = await getRequestIdsUseCase.execute('', 'REQ001');

    expect(mockRepository.findRequestIdsByAdditionalInfo).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return empty array when informacionAdicional is whitespace', async () => {
    const result = await getRequestIdsUseCase.execute('   ', 'REQ001');

    expect(mockRepository.findRequestIdsByAdditionalInfo).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return empty array when linkedRequestId is empty string', async () => {
    const result = await getRequestIdsUseCase.execute('Asignado', '');

    expect(mockRepository.findRequestIdsByAdditionalInfo).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return empty array when linkedRequestId is whitespace', async () => {
    const result = await getRequestIdsUseCase.execute('Asignado', '   ');

    expect(mockRepository.findRequestIdsByAdditionalInfo).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return empty array when both parameters are empty', async () => {
    const result = await getRequestIdsUseCase.execute('', '');

    expect(mockRepository.findRequestIdsByAdditionalInfo).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return empty array when no matching records found', async () => {
    const informacionAdicional = 'Asignado';
    const linkedRequestId = 'REQ999';

    mockRepository.findRequestIdsByAdditionalInfo.mockResolvedValue([]);

    const result = await getRequestIdsUseCase.execute(
      informacionAdicional,
      linkedRequestId,
    );

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const informacionAdicional = 'Asignado';
    const linkedRequestId = 'REQ001';
    const error = new Error('Database error');

    mockRepository.findRequestIdsByAdditionalInfo.mockRejectedValue(error);

    await expect(
      getRequestIdsUseCase.execute(informacionAdicional, linkedRequestId),
    ).rejects.toThrow('Database error');
  });

  it('should handle different informacionAdicional values', async () => {
    const testCases = [
      { info: 'Asignado', linkedReq: 'REQ001' },
      { info: 'No asignado', linkedReq: 'REQ002' },
      { info: 'Pendiente', linkedReq: 'REQ003' },
    ];

    for (const testCase of testCases) {
      mockRepository.findRequestIdsByAdditionalInfo.mockResolvedValue([
        { requestId: `RES-${testCase.info}` },
      ]);

      const result = await getRequestIdsUseCase.execute(
        testCase.info,
        testCase.linkedReq,
      );

      expect(result).toHaveLength(1);
      expect(result[0].requestId).toBe(`RES-${testCase.info}`);
    }
  });
});
