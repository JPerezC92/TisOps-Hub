import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RequestCategorizationController } from '@request-categorization/request-categorization.controller';
import { RequestCategorizationService } from '@request-categorization/request-categorization.service';
import { ExcelParserService } from '@request-categorization/infrastructure/services/excel-parser.service';
import { REQUEST_CATEGORIZATION_REPOSITORY } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import type { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { GetAllRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/get-all-request-categorizations.use-case';
import { GetAllRequestCategorizationsWithAdditionalInfoUseCase } from '@request-categorization/application/use-cases/get-all-with-additional-info.use-case';
import { DeleteAllRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/delete-all-request-categorizations.use-case';
import { UpsertManyRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/upsert-many-request-categorizations.use-case';
import { GetCategorySummaryUseCase } from '@request-categorization/application/use-cases/get-category-summary.use-case';
import { GetRequestIdsByCategorizacionUseCase } from '@request-categorization/application/use-cases/get-request-ids-by-categorizacion.use-case';
import { RequestCategorizationFactory } from './helpers/request-categorization.factory';

describe('RequestCategorizationController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(async () => {
    // Create mock repository using vitest-mock-extended
    mockRepository = mock<IRequestCategorizationRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
          },
        }),
      ],
      controllers: [RequestCategorizationController],
      providers: [
        RequestCategorizationService,
        ExcelParserService,
        // Mock repository
        {
          provide: REQUEST_CATEGORIZATION_REPOSITORY,
          useValue: mockRepository,
        },
        // Use Cases
        {
          provide: GetAllRequestCategorizationsUseCase,
          useFactory: (repository: IRequestCategorizationRepository) => {
            return new GetAllRequestCategorizationsUseCase(repository);
          },
          inject: [REQUEST_CATEGORIZATION_REPOSITORY],
        },
        {
          provide: GetAllRequestCategorizationsWithAdditionalInfoUseCase,
          useFactory: (repository: IRequestCategorizationRepository) => {
            return new GetAllRequestCategorizationsWithAdditionalInfoUseCase(repository);
          },
          inject: [REQUEST_CATEGORIZATION_REPOSITORY],
        },
        {
          provide: DeleteAllRequestCategorizationsUseCase,
          useFactory: (repository: IRequestCategorizationRepository) => {
            return new DeleteAllRequestCategorizationsUseCase(repository);
          },
          inject: [REQUEST_CATEGORIZATION_REPOSITORY],
        },
        {
          provide: UpsertManyRequestCategorizationsUseCase,
          useFactory: (repository: IRequestCategorizationRepository) => {
            return new UpsertManyRequestCategorizationsUseCase(repository);
          },
          inject: [REQUEST_CATEGORIZATION_REPOSITORY],
        },
        {
          provide: GetCategorySummaryUseCase,
          useFactory: (repository: IRequestCategorizationRepository) => {
            return new GetCategorySummaryUseCase(repository);
          },
          inject: [REQUEST_CATEGORIZATION_REPOSITORY],
        },
        {
          provide: GetRequestIdsByCategorizacionUseCase,
          useFactory: (repository: IRequestCategorizationRepository) => {
            return new GetRequestIdsByCategorizacionUseCase(repository);
          },
          inject: [REQUEST_CATEGORIZATION_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /request-categorization', () => {
    it('should return all request categorizations with additional info', async () => {
      const mockData = RequestCategorizationFactory.createManyWithAdditionalInfo(1);

      mockRepository.findAllWithAdditionalInfo.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer())
        .get('/request-categorization')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        requestId: mockData[0].requestId,
        category: mockData[0].category,
        technician: mockData[0].technician,
      });
      expect(mockRepository.findAllWithAdditionalInfo).toHaveBeenCalledOnce();
    });

    it('should return empty array when no records exist', async () => {
      mockRepository.findAllWithAdditionalInfo.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/request-categorization')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /request-categorization/summary', () => {
    it('should return category summary', async () => {
      const mockSummary = [
        { category: 'Incident', count: 10 },
        { category: 'Service Request', count: 5 },
      ];

      mockRepository.getCategorySummary.mockResolvedValue(mockSummary);

      const response = await request(app.getHttpServer())
        .get('/request-categorization/summary')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: 'Incident', count: 10 }),
          expect.objectContaining({ category: 'Service Request', count: 5 }),
        ]),
      );
      expect(mockRepository.getCategorySummary).toHaveBeenCalledOnce();
    });

    it('should return empty array when no categories exist', async () => {
      mockRepository.getCategorySummary.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/request-categorization/summary')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /request-categorization/request-ids-by-categorization', () => {
    it('should return request IDs by categorization', async () => {
      const mockResults = [
        { requestId: 'REQ001', requestIdLink: 'https://example.com/REQ001' },
        { requestId: 'REQ002' },
      ];

      mockRepository.findRequestIdsByCategorizacion.mockResolvedValue(mockResults);

      const response = await request(app.getHttpServer())
        .get('/request-categorization/request-ids-by-categorization?linkedRequestId=REQ123&categorizacion=Incident')
        .expect(200);

      expect(response.body).toMatchObject({
        requestIds: expect.arrayContaining([
          expect.objectContaining({ requestId: 'REQ001' }),
        ]),
      });
      expect(mockRepository.findRequestIdsByCategorizacion).toHaveBeenCalledWith(
        'REQ123',
        'Incident',
      );
    });

    it('should return 400 when linkedRequestId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-categorization/request-ids-by-categorization?categorizacion=Incident')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('required'),
      });
    });

    it('should return 400 when categorizacion is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-categorization/request-ids-by-categorization?linkedRequestId=REQ123')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('required'),
      });
    });

    it('should return empty array when no matching records', async () => {
      mockRepository.findRequestIdsByCategorizacion.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/request-categorization/request-ids-by-categorization?linkedRequestId=REQ999&categorizacion=NoMatch')
        .expect(200);

      expect(response.body).toMatchObject({
        requestIds: [],
      });
    });
  });

  describe('POST /request-categorization/upload', () => {
    it('should upload and process real Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/REP001 PARA ETIQUETAR.xlsx');
      const fileBuffer = readFileSync(filePath);

      // Mock repository method to prevent actual database write
      mockRepository.upsertMany.mockResolvedValue({ created: 2, updated: 0 });

      const response = await request(app.getHttpServer())
        .post('/request-categorization/upload')
        .attach('file', fileBuffer, {
          filename: 'REP001 PARA ETIQUETAR.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'File uploaded and parsed successfully',
        recordsCreated: expect.any(Number),
        recordsUpdated: expect.any(Number),
        totalRecords: expect.any(Number),
      });
      expect(mockRepository.upsertMany).toHaveBeenCalled();
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/request-categorization/upload')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'No file uploaded',
      });
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/request-categorization/upload')
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

  describe('DELETE /request-categorization', () => {
    it('should delete all request categorizations', async () => {
      mockRepository.deleteAll.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/request-categorization')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'All records deleted successfully',
      });
      expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    });
  });
});
