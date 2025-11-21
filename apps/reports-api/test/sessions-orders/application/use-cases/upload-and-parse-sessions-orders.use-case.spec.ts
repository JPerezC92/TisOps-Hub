import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UploadAndParseSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/upload-and-parse-sessions-orders.use-case';
import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import { SessionsOrdersFactory } from '../../helpers/sessions-orders.factory';

describe('UploadAndParseSessionsOrdersUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseSessionsOrdersUseCase;
  let mockRepository: MockProxy<ISessionsOrdersRepository>;

  beforeEach(() => {
    mockRepository = mock<ISessionsOrdersRepository>();
    uploadAndParseUseCase = new UploadAndParseSessionsOrdersUseCase(mockRepository);
  });

  it('should handle empty records arrays', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(0);
    mockRepository.deleteAllReleases.mockResolvedValue(0);
    mockRepository.bulkCreateMain.mockResolvedValue(undefined);
    mockRepository.bulkCreateReleases.mockResolvedValue(undefined);

    const result = await uploadAndParseUseCase.execute([], []);

    expect(result.importedMain).toBe(0);
    expect(result.importedReleases).toBe(0);
  });

  it('should parse valid records successfully', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(0);
    mockRepository.deleteAllReleases.mockResolvedValue(0);
    mockRepository.bulkCreateMain.mockResolvedValue(undefined);
    mockRepository.bulkCreateReleases.mockResolvedValue(undefined);

    const mainRecords = SessionsOrdersFactory.createManySessionsOrders(3);
    const releaseRecords = SessionsOrdersFactory.createManyReleases(2);

    const result = await uploadAndParseUseCase.execute(mainRecords, releaseRecords);

    expect(result.message).toBe('File uploaded and parsed successfully');
    expect(result.importedMain).toBe(3);
    expect(result.importedReleases).toBe(2);
    expect(mockRepository.deleteAllMain).toHaveBeenCalledOnce();
    expect(mockRepository.deleteAllReleases).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreateMain).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreateReleases).toHaveBeenCalledOnce();
  });

  it('should handle empty releases sheet', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(0);
    mockRepository.deleteAllReleases.mockResolvedValue(0);
    mockRepository.bulkCreateMain.mockResolvedValue(undefined);
    mockRepository.bulkCreateReleases.mockResolvedValue(undefined);

    const mainRecords = SessionsOrdersFactory.createManySessionsOrders(2);

    const result = await uploadAndParseUseCase.execute(mainRecords, []);

    expect(result.importedMain).toBe(2);
    expect(result.importedReleases).toBe(0);
  });

  it('should handle repository errors', async () => {
    mockRepository.deleteAllMain.mockRejectedValue(new Error('Database error'));

    const mainRecords = SessionsOrdersFactory.createManySessionsOrders(2);
    const releaseRecords = SessionsOrdersFactory.createManyReleases(1);

    await expect(uploadAndParseUseCase.execute(mainRecords, releaseRecords)).rejects.toThrow('Database error');
  });
});
