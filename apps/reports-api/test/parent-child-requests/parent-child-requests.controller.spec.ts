import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ParentChildRequestsController } from '@parent-child-requests/parent-child-requests.controller';
import { ParentChildRequestsService } from '@parent-child-requests/parent-child-requests.service';
import { ExcelParserService } from '@parent-child-requests/infrastructure/services/excel-parser.service';
import { PARENT_CHILD_REQUEST_REPOSITORY } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import type { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { GetAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/get-all-parent-child-requests.use-case';
import { GetChildrenByParentUseCase } from '@parent-child-requests/application/use-cases/get-children-by-parent.use-case';
import { GetStatsUseCase } from '@parent-child-requests/application/use-cases/get-stats.use-case';
import { CreateManyParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/create-many.use-case';
import { ParentChildRequestFactory } from './helpers/parent-child-request.factory';

describe('ParentChildRequestsController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IParentChildRequestRepository>;
  let excelParserService: ExcelParserService;

  beforeEach(async () => {
    // Create mock repository using vitest-mock-extended
    mockRepository = mock<IParentChildRequestRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
          },
        }),
      ],
      controllers: [ParentChildRequestsController],
      providers: [
        ParentChildRequestsService,
        ExcelParserService,
        // Mock repository
        {
          provide: PARENT_CHILD_REQUEST_REPOSITORY,
          useValue: mockRepository,
        },
        // Use Cases
        {
          provide: GetAllParentChildRequestsUseCase,
          useFactory: (repository: IParentChildRequestRepository) => {
            return new GetAllParentChildRequestsUseCase(repository);
          },
          inject: [PARENT_CHILD_REQUEST_REPOSITORY],
        },
        {
          provide: GetChildrenByParentUseCase,
          useFactory: (repository: IParentChildRequestRepository) => {
            return new GetChildrenByParentUseCase(repository);
          },
          inject: [PARENT_CHILD_REQUEST_REPOSITORY],
        },
        {
          provide: GetStatsUseCase,
          useFactory: (repository: IParentChildRequestRepository) => {
            return new GetStatsUseCase(repository);
          },
          inject: [PARENT_CHILD_REQUEST_REPOSITORY],
        },
        {
          provide: CreateManyParentChildRequestsUseCase,
          useFactory: (repository: IParentChildRequestRepository) => {
            return new CreateManyParentChildRequestsUseCase(repository);
          },
          inject: [PARENT_CHILD_REQUEST_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    excelParserService = moduleFixture.get<ExcelParserService>(ExcelParserService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /parent-child-requests', () => {
    it('should return all parent-child relationships', async () => {
      const mockRelationships = ParentChildRequestFactory.createMany(3);

      mockRepository.findAll.mockResolvedValue(mockRelationships);
      mockRepository.countAll.mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .get('/parent-child-requests')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.countAll).toHaveBeenCalledOnce();
    });

    it('should return paginated results with limit and offset', async () => {
      const mockRelationships = ParentChildRequestFactory.createMany(2);

      mockRepository.findAll.mockResolvedValue(mockRelationships);
      mockRepository.countAll.mockResolvedValue(10);

      const response = await request(app.getHttpServer())
        .get('/parent-child-requests?limit=2&offset=5')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(10);
      expect(mockRepository.findAll).toHaveBeenCalledWith(2, 5);
      expect(mockRepository.countAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no relationships exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.countAll.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/parent-child-requests')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /parent-child-requests/stats', () => {
    it('should return statistics', async () => {
      const mockStats = {
        totalRecords: 100,
        uniqueParents: 25,
        topParents: [
          { linkedRequestId: 'REQ001', count: 10 },
          { linkedRequestId: 'REQ002', count: 8 },
        ],
      };

      mockRepository.getStats.mockResolvedValue(mockStats);

      const response = await request(app.getHttpServer())
        .get('/parent-child-requests/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalRecords: 100,
        uniqueParents: 25,
        topParents: expect.arrayContaining([
          expect.objectContaining({ linkedRequestId: 'REQ001', count: 10 }),
        ]),
      });
      expect(mockRepository.getStats).toHaveBeenCalledOnce();
    });

    it('should return empty statistics when no data exists', async () => {
      const mockStats = {
        totalRecords: 0,
        uniqueParents: 0,
        topParents: [],
      };

      mockRepository.getStats.mockResolvedValue(mockStats);

      const response = await request(app.getHttpServer())
        .get('/parent-child-requests/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalRecords: 0,
        uniqueParents: 0,
        topParents: [],
      });
    });
  });

  describe('GET /parent-child-requests/parent/:id', () => {
    it('should return all children for a specific parent', async () => {
      const parentId = 'REQ123';
      const mockChildren = ParentChildRequestFactory.createMany(2, {
        linkedRequestId: parentId,
      });

      mockRepository.findByParentId.mockResolvedValue(
        mockChildren,
      );

      const response = await request(app.getHttpServer())
        .get(`/parent-child-requests/parent/${parentId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].linkedRequestId).toBe(parentId);
      expect(mockRepository.findByParentId).toHaveBeenCalledWith(parentId);
    });

    it('should return empty array when parent has no children', async () => {
      const parentId = 'REQ999';

      mockRepository.findByParentId.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get(`/parent-child-requests/parent/${parentId}`)
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockRepository.findByParentId).toHaveBeenCalledWith(parentId);
    });
  });

  describe('POST /parent-child-requests/upload', () => {
    it('should upload and process real Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/REP02 padre hijo.xlsx');
      const fileBuffer = readFileSync(filePath);

      // Mock repository methods to prevent actual database write
      mockRepository.dropAndRecreateTable.mockResolvedValue(undefined);
      mockRepository.bulkCreate.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/parent-child-requests/upload')
        .attach('file', fileBuffer, {
          filename: 'REP02 padre hijo.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'File processed successfully',
        imported: expect.any(Number),
        skipped: expect.any(Number),
        total: expect.any(Number),
      });
      expect(mockRepository.dropAndRecreateTable).toHaveBeenCalled();
      expect(mockRepository.bulkCreate).toHaveBeenCalled();
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/parent-child-requests/upload')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'No file uploaded',
      });
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/parent-child-requests/upload')
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

    it('should handle parsing errors gracefully', async () => {
      // Mock parser to throw an error
      vi.spyOn(excelParserService, 'parseExcelFile').mockImplementation(() => {
        throw new Error('Failed to parse Excel file');
      });

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/parent-child-requests/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'test.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Failed to process file'),
      });
    });
  });
});
