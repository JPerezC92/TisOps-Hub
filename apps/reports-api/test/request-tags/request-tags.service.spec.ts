import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { RequestTagsService } from '@request-tags/request-tags.service';
import { GetAllRequestTagsUseCase } from '@request-tags/application/use-cases/get-all-request-tags.use-case';
import { DeleteAllRequestTagsUseCase } from '@request-tags/application/use-cases/delete-all-request-tags.use-case';
import { ImportRequestTagsUseCase } from '@request-tags/application/use-cases/import-request-tags.use-case';
import { CreateRequestTagUseCase } from '@request-tags/application/use-cases/create-request-tag.use-case';
import { RequestTagAlreadyExistsError } from '@request-tags/domain/errors/request-tag-already-exists.error';
import {
  IRequestTagRepository,
  RequestTagData,
} from '@request-tags/domain/repositories/request-tag.repository.interface';
import { RequestTagFactory } from './helpers/request-tag.factory';

describe('RequestTagsService', () => {
  let service: RequestTagsService;
  let mockRepository: MockProxy<IRequestTagRepository>;

  // Real use cases with mock repository
  let getAllUseCase: GetAllRequestTagsUseCase;
  let deleteAllUseCase: DeleteAllRequestTagsUseCase;
  let importUseCase: ImportRequestTagsUseCase;
  let createUseCase: CreateRequestTagUseCase;

  beforeEach(() => {
    mockRepository = mock<IRequestTagRepository>();

    // Create real use cases with mock repository
    getAllUseCase = new GetAllRequestTagsUseCase(mockRepository);
    deleteAllUseCase = new DeleteAllRequestTagsUseCase(mockRepository);
    importUseCase = new ImportRequestTagsUseCase(mockRepository);
    createUseCase = new CreateRequestTagUseCase(mockRepository);

    service = new RequestTagsService(
      getAllUseCase,
      deleteAllUseCase,
      importUseCase,
      createUseCase,
    );
  });

  describe('create', () => {
    const validTagData: RequestTagData = {
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

    it('should return JSend success when creating new tag', async () => {
      const createdTag = RequestTagFactory.create(validTagData);

      // Repository returns null (tag doesn't exist) and then creates it
      mockRepository.findByRequestId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdTag);

      const result = await service.create(validTagData);

      expect(result).toEqual({
        status: 'success',
        data: createdTag,
      });
      expect(mockRepository.findByRequestId).toHaveBeenCalledWith('REQ001');
      expect(mockRepository.create).toHaveBeenCalledWith(validTagData);
    });

    it('should throw RequestTagAlreadyExistsError when tag already exists', async () => {
      const existingTag = RequestTagFactory.create(validTagData);

      // Repository returns existing tag (duplicate)
      mockRepository.findByRequestId.mockResolvedValue(existingTag);

      await expect(service.create(validTagData)).rejects.toThrow(
        RequestTagAlreadyExistsError,
      );
      expect(mockRepository.findByRequestId).toHaveBeenCalledWith('REQ001');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error with correct requestId when duplicate', async () => {
      const existingTag = RequestTagFactory.create(validTagData);
      mockRepository.findByRequestId.mockResolvedValue(existingTag);

      try {
        await service.create(validTagData);
        expect.fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBeInstanceOf(RequestTagAlreadyExistsError);
        expect((e as RequestTagAlreadyExistsError).requestId).toBe('REQ001');
      }
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findByRequestId.mockRejectedValue(error);

      await expect(service.create(validTagData)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return JSend success with tags and total from repository', async () => {
      const mockTags = RequestTagFactory.createMany(3);
      mockRepository.findAll.mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(result).toEqual({
        status: 'success',
        data: {
          tags: mockTags,
          total: 3,
        },
      });
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return JSend success with empty array when no tags exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({
        status: 'success',
        data: {
          tags: [],
          total: 0,
        },
      });
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('deleteAll', () => {
    it('should return JSend success with deleted count', async () => {
      mockRepository.count.mockResolvedValue(25);
      mockRepository.deleteAll.mockResolvedValue(undefined);

      const result = await service.deleteAll();

      expect(result).toEqual({
        status: 'success',
        data: {
          deleted: 25,
        },
      });
      expect(mockRepository.count).toHaveBeenCalledOnce();
      expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    });

    it('should handle zero deletions with JSend success', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.deleteAll.mockResolvedValue(undefined);

      const result = await service.deleteAll();

      expect(result).toEqual({
        status: 'success',
        data: {
          deleted: 0,
        },
      });
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Delete error');
      mockRepository.count.mockRejectedValue(error);

      await expect(service.deleteAll()).rejects.toThrow('Delete error');
    });
  });
});
