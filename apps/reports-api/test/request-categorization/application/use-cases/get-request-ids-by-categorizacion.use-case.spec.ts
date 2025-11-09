import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { faker } from '@faker-js/faker';
import { GetRequestIdsByCategorizacionUseCase } from '@request-categorization/application/use-cases/get-request-ids-by-categorizacion.use-case';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';

describe('GetRequestIdsByCategorizacionUseCase', () => {
  let getRequestIdsUseCase: GetRequestIdsByCategorizacionUseCase;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestCategorizationRepository>();
    getRequestIdsUseCase = new GetRequestIdsByCategorizacionUseCase(
      mockRepository,
    );
  });

  it('should return request IDs for given linked request and categorization', async () => {
    const linkedRequestId = 'REQ001';
    const categorizacion = 'Incident';
    const expectedResult = [
      {
        requestId: `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
        requestIdLink: faker.internet.url(),
      },
      {
        requestId: `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
        requestIdLink: faker.internet.url(),
      },
    ];

    mockRepository.findRequestIdsByCategorizacion.mockResolvedValue(
      expectedResult,
    );

    const result = await getRequestIdsUseCase.execute(
      linkedRequestId,
      categorizacion,
    );

    expect(
      mockRepository.findRequestIdsByCategorizacion,
    ).toHaveBeenCalledWith(linkedRequestId, categorizacion);
    expect(mockRepository.findRequestIdsByCategorizacion).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no matching request IDs found', async () => {
    const linkedRequestId = 'REQ001';
    const categorizacion = 'Incident';

    mockRepository.findRequestIdsByCategorizacion.mockResolvedValue([]);

    const result = await getRequestIdsUseCase.execute(
      linkedRequestId,
      categorizacion,
    );

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const linkedRequestId = 'REQ001';
    const categorizacion = 'Incident';
    const error = new Error('Database error');

    mockRepository.findRequestIdsByCategorizacion.mockRejectedValue(error);

    await expect(
      getRequestIdsUseCase.execute(linkedRequestId, categorizacion),
    ).rejects.toThrow('Database error');
  });

  it('should return request IDs without links', async () => {
    const linkedRequestId = 'REQ001';
    const categorizacion = 'Service Request';
    const expectedResult = [
      { requestId: 'REQ002' },
      { requestId: 'REQ003' },
    ];

    mockRepository.findRequestIdsByCategorizacion.mockResolvedValue(
      expectedResult,
    );

    const result = await getRequestIdsUseCase.execute(
      linkedRequestId,
      categorizacion,
    );

    expect(result).toHaveLength(2);
    expect(result[0].requestIdLink).toBeUndefined();
    expect(result[1].requestIdLink).toBeUndefined();
  });

  it('should return single request ID', async () => {
    const linkedRequestId = 'REQ001';
    const categorizacion = 'Change';
    const expectedResult = [
      { requestId: 'REQ005', requestIdLink: faker.internet.url() },
    ];

    mockRepository.findRequestIdsByCategorizacion.mockResolvedValue(
      expectedResult,
    );

    const result = await getRequestIdsUseCase.execute(
      linkedRequestId,
      categorizacion,
    );

    expect(result).toHaveLength(1);
    expect(result[0].requestId).toBe('REQ005');
  });
});
