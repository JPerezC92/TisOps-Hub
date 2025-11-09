import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { faker } from '@faker-js/faker';
import { GetAllRequestCategorizationsWithAdditionalInfoUseCase } from '@request-categorization/application/use-cases/get-all-with-additional-info.use-case';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';

describe('GetAllRequestCategorizationsWithAdditionalInfoUseCase', () => {
  let getAllWithAdditionalInfoUseCase: GetAllRequestCategorizationsWithAdditionalInfoUseCase;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestCategorizationRepository>();
    getAllWithAdditionalInfoUseCase =
      new GetAllRequestCategorizationsWithAdditionalInfoUseCase(mockRepository);
  });

  it('should return all categorizations with additional info', async () => {
    const expectedData = [
      {
        requestId: `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
        category: 'Incident',
        technician: faker.person.fullName(),
        createdTime: faker.date.recent().toISOString(),
        modulo: 'IT',
        subject: faker.lorem.sentence(),
        problemId: `PROB${faker.string.alphanumeric(6).toUpperCase()}`,
        linkedRequestId: `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
        requestIdLink: faker.internet.url(),
        linkedRequestIdLink: faker.internet.url(),
        additionalInformation: ['Info 1', 'Info 2'],
        tagCategorizacion: ['Tag 1', 'Tag 2'],
      },
    ];

    mockRepository.findAllWithAdditionalInfo.mockResolvedValue(expectedData);

    const result = await getAllWithAdditionalInfoUseCase.execute();

    expect(mockRepository.findAllWithAdditionalInfo).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedData);
    expect(result[0].additionalInformation).toHaveLength(2);
    expect(result[0].tagCategorizacion).toHaveLength(2);
  });

  it('should return empty array when no data exists', async () => {
    mockRepository.findAllWithAdditionalInfo.mockResolvedValue([]);

    const result = await getAllWithAdditionalInfoUseCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAllWithAdditionalInfo.mockRejectedValue(error);

    await expect(getAllWithAdditionalInfoUseCase.execute()).rejects.toThrow(
      'Database error',
    );
  });

  it('should return data without optional links', async () => {
    const expectedData = [
      {
        requestId: 'REQ001',
        category: 'Service Request',
        technician: 'John Doe',
        createdTime: faker.date.recent().toISOString(),
        modulo: 'HR',
        subject: 'Test subject',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        additionalInformation: [],
        tagCategorizacion: [],
      },
    ];

    mockRepository.findAllWithAdditionalInfo.mockResolvedValue(expectedData);

    const result = await getAllWithAdditionalInfoUseCase.execute();

    expect(result[0].requestIdLink).toBeUndefined();
    expect(result[0].linkedRequestIdLink).toBeUndefined();
    expect(result[0].additionalInformation).toHaveLength(0);
    expect(result[0].tagCategorizacion).toHaveLength(0);
  });

  it('should return multiple categorizations with different additional info', async () => {
    const expectedData = [
      {
        requestId: 'REQ001',
        category: 'Incident',
        technician: 'Alice Smith',
        createdTime: faker.date.recent().toISOString(),
        modulo: 'IT',
        subject: 'Network issue',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        additionalInformation: ['Network down', 'Critical'],
        tagCategorizacion: ['Urgent', 'Network'],
      },
      {
        requestId: 'REQ003',
        category: 'Change',
        technician: 'Bob Johnson',
        createdTime: faker.date.recent().toISOString(),
        modulo: 'Finance',
        subject: 'Budget update',
        problemId: 'PROB002',
        linkedRequestId: 'REQ004',
        additionalInformation: ['Approved'],
        tagCategorizacion: ['Budget'],
      },
    ];

    mockRepository.findAllWithAdditionalInfo.mockResolvedValue(expectedData);

    const result = await getAllWithAdditionalInfoUseCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].additionalInformation).toEqual([
      'Network down',
      'Critical',
    ]);
    expect(result[1].additionalInformation).toEqual(['Approved']);
  });
});
