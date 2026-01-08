import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RequestTagsController } from '@request-tags/request-tags.controller';
import { RequestTagsService } from '@request-tags/request-tags.service';
import { REQUEST_TAG_REPOSITORY } from '@request-tags/domain/repositories/request-tag.repository.interface';
import type { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';
import { GetAllRequestTagsUseCase } from '@request-tags/application/use-cases/get-all-request-tags.use-case';
import { DeleteAllRequestTagsUseCase } from '@request-tags/application/use-cases/delete-all-request-tags.use-case';
import { ImportRequestTagsUseCase } from '@request-tags/application/use-cases/import-request-tags.use-case';
import { CreateRequestTagUseCase } from '@request-tags/application/use-cases/create-request-tag.use-case';
import { GetRequestIdsByAdditionalInfoUseCase } from '@request-tags/application/use-cases/get-request-ids-by-additional-info.use-case';
import { GetMissingIdsByLinkedRequestUseCase } from '@request-tags/application/use-cases/get-missing-ids-by-linked-request.use-case';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { RequestTagFactory } from './helpers/request-tag.factory';

describe('RequestTagsController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IRequestTagRepository>;

  beforeEach(async () => {
    // Create mock repository using vitest-mock-extended
    mockRepository = mock<IRequestTagRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
          },
        }),
      ],
      controllers: [RequestTagsController],
      providers: [
        RequestTagsService,
        // Mock repository
        {
          provide: REQUEST_TAG_REPOSITORY,
          useValue: mockRepository,
        },
        // Use Cases
        {
          provide: GetAllRequestTagsUseCase,
          useFactory: (repository: IRequestTagRepository) => {
            return new GetAllRequestTagsUseCase(repository);
          },
          inject: [REQUEST_TAG_REPOSITORY],
        },
        {
          provide: DeleteAllRequestTagsUseCase,
          useFactory: (repository: IRequestTagRepository) => {
            return new DeleteAllRequestTagsUseCase(repository);
          },
          inject: [REQUEST_TAG_REPOSITORY],
        },
        {
          provide: ImportRequestTagsUseCase,
          useFactory: (repository: IRequestTagRepository) => {
            return new ImportRequestTagsUseCase(repository);
          },
          inject: [REQUEST_TAG_REPOSITORY],
        },
        {
          provide: CreateRequestTagUseCase,
          useFactory: (repository: IRequestTagRepository) => {
            return new CreateRequestTagUseCase(repository);
          },
          inject: [REQUEST_TAG_REPOSITORY],
        },
        {
          provide: GetRequestIdsByAdditionalInfoUseCase,
          useFactory: (repository: IRequestTagRepository) => {
            return new GetRequestIdsByAdditionalInfoUseCase(repository);
          },
          inject: [REQUEST_TAG_REPOSITORY],
        },
        {
          provide: GetMissingIdsByLinkedRequestUseCase,
          useFactory: (repository: IRequestTagRepository) => {
            return new GetMissingIdsByLinkedRequestUseCase(repository);
          },
          inject: [REQUEST_TAG_REPOSITORY],
        },
        // Global validation pipe
        {
          provide: APP_PIPE,
          useClass: ZodValidationPipe,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Register DomainErrorFilter for 409 responses
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /request-tags', () => {
    it('should return all request tags with JSend success format', async () => {
      const mockTags = RequestTagFactory.createMany(3);
      mockRepository.findAll.mockResolvedValue(mockTags);

      const response = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          tags: expect.any(Array),
          total: 3,
        },
      });
      expect(response.body.data.tags).toHaveLength(3);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no tags exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          tags: [],
          total: 0,
        },
      });
    });
  });

  describe('POST /request-tags', () => {
    const validTagData = {
      requestId: 'REQ-INT-001',
      createdTime: '2024-01-15T10:00:00Z',
      informacionAdicional: 'Asignado',
      modulo: 'IT',
      problemId: 'PROB001',
      linkedRequestId: 'REQ-LINKED-001',
      jira: 'JIRA-123',
      categorizacion: 'Incident',
      technician: 'John Doe',
    };

    it('should create a new request tag and return 201 with JSend success', async () => {
      const createdTag = RequestTagFactory.create(validTagData);

      // Repository: tag doesn't exist, then create it
      mockRepository.findByRequestId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdTag);

      const response = await request(app.getHttpServer())
        .post('/request-tags')
        .send(validTagData)
        .expect(201);

      expect(response.body).toMatchObject({
        status: 'success',
        data: expect.objectContaining({
          requestId: validTagData.requestId,
        }),
      });
      expect(mockRepository.findByRequestId).toHaveBeenCalledWith(validTagData.requestId);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should return 409 with JSend fail when tag already exists', async () => {
      const existingTag = RequestTagFactory.create(validTagData);

      // Repository: tag already exists
      mockRepository.findByRequestId.mockResolvedValue(existingTag);

      const response = await request(app.getHttpServer())
        .post('/request-tags')
        .send(validTagData)
        .expect(409);

      expect(response.body).toMatchObject({
        status: 'fail',
        data: {
          code: 'REQUEST_TAG_ALREADY_EXISTS',
          message: expect.stringContaining(validTagData.requestId),
        },
      });
      expect(mockRepository.findByRequestId).toHaveBeenCalledWith(validTagData.requestId);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidData = {
        requestId: 'REQ-INVALID',
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/request-tags')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /request-tags/upload', () => {
    it('should upload and process real Excel file with JSend success format', async () => {
      const filePath = join(__dirname, '../../files/REP01 XD TAG 2025.xlsx');
      const fileBuffer = readFileSync(filePath);

      // Mock repository methods to prevent actual database write
      mockRepository.deleteAll.mockResolvedValue(undefined);
      mockRepository.createMany.mockResolvedValue(100); // Mock that 100 records were imported

      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .attach('file', fileBuffer, {
          filename: 'REP01 XD TAG 2025.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          imported: expect.any(Number),
          skipped: expect.any(Number),
          total: expect.any(Number),
        },
      });
      expect(mockRepository.deleteAll).toHaveBeenCalled();
      expect(mockRepository.createMany).toHaveBeenCalled();
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'No file uploaded',
      });
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .attach('file', fakeBuffer, {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid file type'),
      });
    });
  });

  describe('DELETE /request-tags', () => {
    it('should delete all request tags with JSend success format', async () => {
      mockRepository.count.mockResolvedValue(10);
      mockRepository.deleteAll.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/request-tags')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          deleted: 10,
        },
      });
      expect(mockRepository.count).toHaveBeenCalledOnce();
      expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    });
  });

  describe('GET /request-tags/by-additional-info', () => {
    it('should return request IDs by additional info with JSend success format', async () => {
      const mockResults = [
        { requestId: 'REQ001', requestIdLink: 'https://example.com/REQ001' },
        { requestId: 'REQ002', requestIdLink: 'https://example.com/REQ002' },
      ];

      mockRepository.findRequestIdsByAdditionalInfo.mockResolvedValue(mockResults);

      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=Asignado&linkedRequestId=REQ123')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          requestIds: expect.arrayContaining([
            expect.objectContaining({ requestId: 'REQ001' }),
            expect.objectContaining({ requestId: 'REQ002' }),
          ]),
        },
      });
      expect(response.body.data.requestIds).toHaveLength(2);
      expect(mockRepository.findRequestIdsByAdditionalInfo).toHaveBeenCalledWith(
        'Asignado',
        'REQ123',
      );
    });

    it('should return 400 when info query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?linkedRequestId=REQ123')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'Query parameter "info" is required',
      });
    });

    it('should return 400 when linkedRequestId query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=Asignado')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'Query parameter "linkedRequestId" is required',
      });
    });

    it('should return empty array when no matching records', async () => {
      mockRepository.findRequestIdsByAdditionalInfo.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=NoExist&linkedRequestId=REQ999')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          requestIds: [],
        },
      });
    });
  });

  describe('GET /request-tags/missing-ids', () => {
    it('should return missing request IDs with JSend success format', async () => {
      const mockMissingIds = [
        { requestId: 'REQ005', requestIdLink: 'https://example.com/REQ005' },
        { requestId: 'REQ006' },
      ];

      mockRepository.findMissingIdsByLinkedRequestId.mockResolvedValue(mockMissingIds);

      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids?linkedRequestId=REQ123')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          missingIds: expect.arrayContaining([
            expect.objectContaining({ requestId: 'REQ005' }),
            expect.objectContaining({ requestId: 'REQ006' }),
          ]),
        },
      });
      expect(mockRepository.findMissingIdsByLinkedRequestId).toHaveBeenCalledWith('REQ123');
    });

    it('should return 400 when linkedRequestId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'Query parameter "linkedRequestId" is required',
      });
    });

    it('should return empty array when no missing IDs', async () => {
      mockRepository.findMissingIdsByLinkedRequestId.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids?linkedRequestId=REQ123')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          missingIds: [],
        },
      });
    });
  });
});
