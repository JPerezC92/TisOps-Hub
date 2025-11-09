import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
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
import { GetRequestIdsByAdditionalInfoUseCase } from '@request-tags/application/use-cases/get-request-ids-by-additional-info.use-case';
import { GetMissingIdsByLinkedRequestUseCase } from '@request-tags/application/use-cases/get-missing-ids-by-linked-request.use-case';
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /request-tags', () => {
    it('should return all request tags', async () => {
      const mockTags = RequestTagFactory.createMany(3);
      mockRepository.findAll.mockResolvedValue(mockTags);

      const response = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        total: 3,
      });
      expect(response.body.data).toHaveLength(3);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no tags exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        total: 0,
      });
    });
  });

  describe('POST /request-tags/upload', () => {
    it('should upload and process real Excel file successfully', async () => {
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
        message: 'File uploaded and parsed successfully',
        imported: expect.any(Number),
        skipped: expect.any(Number),
        total: expect.any(Number),
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
    it('should delete all request tags', async () => {
      mockRepository.count.mockResolvedValue(10);
      mockRepository.deleteAll.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/request-tags')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'All records deleted successfully',
        deleted: 10,
      });
      expect(mockRepository.count).toHaveBeenCalledOnce();
      expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    });
  });

  describe('GET /request-tags/by-additional-info', () => {
    it('should return request IDs by additional info', async () => {
      const mockResults = [
        { requestId: 'REQ001', requestIdLink: 'https://example.com/REQ001' },
        { requestId: 'REQ002', requestIdLink: 'https://example.com/REQ002' },
      ];

      mockRepository.findRequestIdsByAdditionalInfo.mockResolvedValue(mockResults);

      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=Asignado&linkedRequestId=REQ123')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        requestId: 'REQ001',
        requestIdLink: 'https://example.com/REQ001',
      });
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

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /request-tags/missing-ids', () => {
    it('should return missing request IDs', async () => {
      const mockMissingIds = [
        { requestId: 'REQ005', requestIdLink: 'https://example.com/REQ005' },
        { requestId: 'REQ006' },
      ];

      mockRepository.findMissingIdsByLinkedRequestId.mockResolvedValue(mockMissingIds);

      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids?linkedRequestId=REQ123')
        .expect(200);

      expect(response.body).toMatchObject({
        missingIds: expect.arrayContaining([
          expect.objectContaining({ requestId: 'REQ005' }),
          expect.objectContaining({ requestId: 'REQ006' }),
        ]),
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
        missingIds: [],
      });
    });
  });
});
