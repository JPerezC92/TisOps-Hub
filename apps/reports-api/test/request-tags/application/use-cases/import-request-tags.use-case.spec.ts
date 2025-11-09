import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { ImportRequestTagsUseCase } from '@request-tags/application/use-cases/import-request-tags.use-case';
import {
  IRequestTagRepository,
  RequestTagData,
} from '@request-tags/domain/repositories/request-tag.repository.interface';

describe('ImportRequestTagsUseCase', () => {
  let importRequestTagsUseCase: ImportRequestTagsUseCase;
  let mockRepository: MockProxy<IRequestTagRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestTagRepository>();
    importRequestTagsUseCase = new ImportRequestTagsUseCase(mockRepository);
  });

  it('should import all tags successfully when data is valid', async () => {
    const tagsData: RequestTagData[] = [
      {
        requestId: 'REQ001',
        createdTime: '2024-01-01T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'IT',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        jira: 'JIRA-123',
        categorizacion: 'Incident',
        technician: 'John Doe',
      },
      {
        requestId: 'REQ002',
        createdTime: '2024-01-02T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'HR',
        problemId: 'PROB002',
        linkedRequestId: 'REQ001',
        jira: 'JIRA-124',
        categorizacion: 'Service Request',
        technician: 'Jane Smith',
      },
    ];

    mockRepository.deleteAll.mockResolvedValue(undefined);
    mockRepository.createMany.mockResolvedValue(2);

    const result = await importRequestTagsUseCase.execute(tagsData);

    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(mockRepository.createMany).toHaveBeenCalledWith(tagsData);
    expect(result).toEqual({ imported: 2, skipped: 0 });
  });

  it('should return zero counts when data array is empty', async () => {
    const result = await importRequestTagsUseCase.execute([]);

    expect(mockRepository.deleteAll).not.toHaveBeenCalled();
    expect(mockRepository.createMany).not.toHaveBeenCalled();
    expect(result).toEqual({ imported: 0, skipped: 0 });
  });

  it('should handle partial import with some skipped records', async () => {
    const tagsData: RequestTagData[] = [
      {
        requestId: 'REQ001',
        createdTime: '2024-01-01T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'IT',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        jira: 'JIRA-123',
        categorizacion: 'Incident',
        technician: 'John Doe',
      },
      {
        requestId: 'REQ002',
        createdTime: '2024-01-02T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'HR',
        problemId: 'PROB002',
        linkedRequestId: 'REQ001',
        jira: 'JIRA-124',
        categorizacion: 'Service Request',
        technician: 'Jane Smith',
      },
      {
        requestId: 'REQ003',
        createdTime: '2024-01-03T00:00:00Z',
        informacionAdicional: 'No asignado',
        modulo: 'Finance',
        problemId: 'PROB003',
        linkedRequestId: 'No asignado',
        jira: 'No asignado',
        categorizacion: 'No asignado',
        technician: 'Bob Wilson',
      },
    ];

    mockRepository.deleteAll.mockResolvedValue(undefined);
    mockRepository.createMany.mockResolvedValue(2); // Only 2 out of 3 imported

    const result = await importRequestTagsUseCase.execute(tagsData);

    expect(result).toEqual({ imported: 2, skipped: 1 });
  });

  it('should delete existing data before importing', async () => {
    const tagsData: RequestTagData[] = [
      {
        requestId: 'REQ001',
        createdTime: '2024-01-01T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'IT',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        jira: 'JIRA-123',
        categorizacion: 'Incident',
        technician: 'John Doe',
      },
    ];

    mockRepository.deleteAll.mockResolvedValue(undefined);
    mockRepository.createMany.mockResolvedValue(1);

    await importRequestTagsUseCase.execute(tagsData);

    // Verify deleteAll is called before createMany
    const deleteAllCall = mockRepository.deleteAll.mock.invocationCallOrder[0];
    const createManyCall =
      mockRepository.createMany.mock.invocationCallOrder[0];

    expect(deleteAllCall).toBeLessThan(createManyCall);
  });

  it('should handle large batch imports', async () => {
    const tagsData: RequestTagData[] = Array.from({ length: 1000 }, (_, i) => ({
      requestId: `REQ${String(i).padStart(6, '0')}`,
      createdTime: '2024-01-01T00:00:00Z',
      informacionAdicional: 'Asignado',
      modulo: 'IT',
      problemId: `PROB${i}`,
      linkedRequestId: `REQ${String(i + 1).padStart(6, '0')}`,
      jira: `JIRA-${i}`,
      categorizacion: 'Incident',
      technician: 'Batch User',
    }));

    mockRepository.deleteAll.mockResolvedValue(undefined);
    mockRepository.createMany.mockResolvedValue(1000);

    const result = await importRequestTagsUseCase.execute(tagsData);

    expect(result).toEqual({ imported: 1000, skipped: 0 });
    expect(mockRepository.createMany).toHaveBeenCalledWith(tagsData);
  });

  it('should handle errors during deleteAll', async () => {
    const tagsData: RequestTagData[] = [
      {
        requestId: 'REQ001',
        createdTime: '2024-01-01T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'IT',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        jira: 'JIRA-123',
        categorizacion: 'Incident',
        technician: 'John Doe',
      },
    ];

    const error = new Error('Failed to delete existing records');
    mockRepository.deleteAll.mockRejectedValue(error);

    await expect(importRequestTagsUseCase.execute(tagsData)).rejects.toThrow(
      'Failed to delete existing records',
    );

    expect(mockRepository.createMany).not.toHaveBeenCalled();
  });

  it('should handle errors during createMany', async () => {
    const tagsData: RequestTagData[] = [
      {
        requestId: 'REQ001',
        createdTime: '2024-01-01T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'IT',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        jira: 'JIRA-123',
        categorizacion: 'Incident',
        technician: 'John Doe',
      },
    ];

    const error = new Error('Failed to import records');
    mockRepository.deleteAll.mockResolvedValue(undefined);
    mockRepository.createMany.mockRejectedValue(error);

    await expect(importRequestTagsUseCase.execute(tagsData)).rejects.toThrow(
      'Failed to import records',
    );

    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
  });

  it('should calculate skipped count correctly when all records fail', async () => {
    const tagsData: RequestTagData[] = [
      {
        requestId: 'REQ001',
        createdTime: '2024-01-01T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'IT',
        problemId: 'PROB001',
        linkedRequestId: 'REQ002',
        jira: 'JIRA-123',
        categorizacion: 'Incident',
        technician: 'John Doe',
      },
      {
        requestId: 'REQ002',
        createdTime: '2024-01-02T00:00:00Z',
        informacionAdicional: 'Asignado',
        modulo: 'HR',
        problemId: 'PROB002',
        linkedRequestId: 'REQ001',
        jira: 'JIRA-124',
        categorizacion: 'Service Request',
        technician: 'Jane Smith',
      },
    ];

    mockRepository.deleteAll.mockResolvedValue(undefined);
    mockRepository.createMany.mockResolvedValue(0); // None imported

    const result = await importRequestTagsUseCase.execute(tagsData);

    expect(result).toEqual({ imported: 0, skipped: 2 });
  });
});
