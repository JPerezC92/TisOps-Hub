import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CreateRequestTagUseCase } from '@request-tags/application/use-cases/create-request-tag.use-case';
import { IRequestTagRepository, RequestTagData } from '@request-tags/domain/repositories/request-tag.repository.interface';
import { RequestTagAlreadyExistsError } from '@request-tags/domain/errors/request-tag-already-exists.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { RequestTagFactory } from '../../helpers/request-tag.factory';

describe('CreateRequestTagUseCase', () => {
  let createRequestTagUseCase: CreateRequestTagUseCase;
  let mockRepository: MockProxy<IRequestTagRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestTagRepository>();
    createRequestTagUseCase = new CreateRequestTagUseCase(mockRepository);
  });

  it('should create new request tag when request ID does not exist', async () => {
    const tagData: RequestTagData = {
      requestId: 'REQ001',
      requestIdLink: 'https://example.com/REQ001',
      createdTime: '2024-01-01T00:00:00Z',
      informacionAdicional: 'Asignado',
      modulo: 'IT',
      problemId: 'PROB001',
      linkedRequestId: 'REQ002',
      linkedRequestIdLink: 'https://example.com/REQ002',
      jira: 'JIRA-123',
      categorizacion: 'Incident',
      technician: 'John Doe',
    };

    const createdTag = RequestTagFactory.create(tagData);

    mockRepository.findByRequestId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(createdTag);

    const result = await createRequestTagUseCase.execute(tagData);

    expect(mockRepository.findByRequestId).toHaveBeenCalledWith('REQ001');
    expect(mockRepository.create).toHaveBeenCalledWith(tagData);
    expect(result).toEqual(createdTag);
  });

  it('should return RequestTagAlreadyExistsError when request ID already exists', async () => {
    const tagData: RequestTagData = {
      requestId: 'REQ001',
      createdTime: '2024-01-01T00:00:00Z',
      informacionAdicional: 'Asignado',
      modulo: 'IT',
      problemId: 'PROB001',
      linkedRequestId: 'REQ002',
      jira: 'JIRA-123',
      categorizacion: 'Incident',
      technician: 'John Doe',
    };

    const existingTag = RequestTagFactory.create({ requestId: 'REQ001' });

    mockRepository.findByRequestId.mockResolvedValue(existingTag);

    const result = await createRequestTagUseCase.execute(tagData);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(RequestTagAlreadyExistsError);
    expect((result as RequestTagAlreadyExistsError).requestId).toBe('REQ001');
    expect(mockRepository.findByRequestId).toHaveBeenCalledWith('REQ001');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should create tag without optional fields', async () => {
    const tagData: RequestTagData = {
      requestId: 'REQ003',
      createdTime: '2024-01-01T00:00:00Z',
      informacionAdicional: 'No asignado',
      modulo: 'HR',
      problemId: 'PROB003',
      linkedRequestId: 'No asignado',
      jira: 'No asignado',
      categorizacion: 'No asignado',
      technician: 'Jane Smith',
    };

    const createdTag = RequestTagFactory.create({
      ...tagData,
      requestIdLink: undefined,
      linkedRequestIdLink: undefined,
    });

    mockRepository.findByRequestId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(createdTag);

    const result = await createRequestTagUseCase.execute(tagData);

    // Type guard: result is RequestTag when creation succeeds
    expect(DomainError.isDomainError(result)).toBe(false);
    if (!DomainError.isDomainError(result)) {
      expect(result.requestIdLink).toBeUndefined();
      expect(result.linkedRequestIdLink).toBeUndefined();
      expect(result.isAssigned()).toBe(false);
      expect(result.hasJiraTicket()).toBe(false);
    }
  });

  it('should handle repository errors during creation', async () => {
    const tagData: RequestTagData = {
      requestId: 'REQ004',
      createdTime: '2024-01-01T00:00:00Z',
      informacionAdicional: 'Asignado',
      modulo: 'Finance',
      problemId: 'PROB004',
      linkedRequestId: 'REQ005',
      jira: 'JIRA-456',
      categorizacion: 'Change',
      technician: 'Alice Johnson',
    };

    const error = new Error('Database error');

    mockRepository.findByRequestId.mockResolvedValue(null);
    mockRepository.create.mockRejectedValue(error);

    await expect(createRequestTagUseCase.execute(tagData)).rejects.toThrow(
      'Database error',
    );
  });

  it('should handle repository errors during existence check', async () => {
    const tagData: RequestTagData = {
      requestId: 'REQ005',
      createdTime: '2024-01-01T00:00:00Z',
      informacionAdicional: 'Asignado',
      modulo: 'IT',
      problemId: 'PROB005',
      linkedRequestId: 'REQ006',
      jira: 'JIRA-789',
      categorizacion: 'Service Request',
      technician: 'Bob Wilson',
    };

    const error = new Error('Database connection lost');

    mockRepository.findByRequestId.mockRejectedValue(error);

    await expect(createRequestTagUseCase.execute(tagData)).rejects.toThrow(
      'Database connection lost',
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
