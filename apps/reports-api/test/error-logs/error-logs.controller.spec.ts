import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { ErrorLogsController } from '@error-logs/error-logs.controller';
import { ERROR_LOG_REPOSITORY } from '@error-logs/domain/repositories/error-log.repository.interface';
import type { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';
import { GetAllErrorLogsUseCase } from '@error-logs/application/use-cases/get-all-error-logs.use-case';
import { GetErrorLogByIdUseCase } from '@error-logs/application/use-cases/get-error-log-by-id.use-case';
import { ErrorLogFactory } from './helpers/error-log.factory';

describe('ErrorLogsController (Integration)', () => {
  let app: INestApplication;
  let mockErrorLogRepository: MockProxy<IErrorLogRepository>;

  beforeEach(async () => {
    // Create mock repository using vitest-mock-extended
    mockErrorLogRepository = mock<IErrorLogRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ErrorLogsController],
      providers: [
        // Mock repository
        {
          provide: ERROR_LOG_REPOSITORY,
          useValue: mockErrorLogRepository,
        },
        // Use Cases with factory providers
        {
          provide: GetAllErrorLogsUseCase,
          useFactory: (errorLogRepository: IErrorLogRepository) => {
            return new GetAllErrorLogsUseCase(errorLogRepository);
          },
          inject: [ERROR_LOG_REPOSITORY],
        },
        {
          provide: GetErrorLogByIdUseCase,
          useFactory: (errorLogRepository: IErrorLogRepository) => {
            return new GetErrorLogByIdUseCase(errorLogRepository);
          },
          inject: [ERROR_LOG_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /error-logs', () => {
    it('should return all error logs', async () => {
      const mockErrorLogs = ErrorLogFactory.createMany(3);

      mockErrorLogRepository.findAll.mockResolvedValue(mockErrorLogs);

      const response = await request(app.getHttpServer())
        .get('/error-logs')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toMatchObject({
        id: mockErrorLogs[0].id,
        errorType: mockErrorLogs[0].errorType,
        errorMessage: mockErrorLogs[0].errorMessage,
      });
      expect(mockErrorLogRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return error logs with limit parameter', async () => {
      const mockErrorLogs = ErrorLogFactory.createMany(2);

      mockErrorLogRepository.findAll.mockResolvedValue(mockErrorLogs);

      const response = await request(app.getHttpServer())
        .get('/error-logs?limit=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(mockErrorLogRepository.findAll).toHaveBeenCalledWith(2);
    });

    it('should return empty array when no error logs exist', async () => {
      mockErrorLogRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/error-logs')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockErrorLogRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should handle specific error types', async () => {
      const mockErrorLogs = [
        ErrorLogFactory.create({ errorType: 'DatabaseError' }),
        ErrorLogFactory.create({ errorType: 'ValidationError' }),
      ];

      mockErrorLogRepository.findAll.mockResolvedValue(mockErrorLogs);

      const response = await request(app.getHttpServer())
        .get('/error-logs')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].errorType).toBe('DatabaseError');
      expect(response.body[1].errorType).toBe('ValidationError');
    });

    it('should return 400 when limit is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/error-logs?limit=invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('GET /error-logs/:id', () => {
    it('should return an error log by id', async () => {
      const mockErrorLog = ErrorLogFactory.create({
        id: 1,
        errorType: 'DatabaseError',
        errorMessage: 'Connection timeout',
      });

      mockErrorLogRepository.findById.mockResolvedValue(mockErrorLog);

      const response = await request(app.getHttpServer())
        .get('/error-logs/1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        errorType: 'DatabaseError',
        errorMessage: 'Connection timeout',
      });
      expect(mockErrorLogRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return error log with all optional fields', async () => {
      const mockErrorLog = ErrorLogFactory.create({
        id: 1,
        errorType: 'NetworkError',
        errorMessage: 'Failed to fetch',
        stackTrace: 'Error at line 42',
        endpoint: '/api/test',
        method: 'POST',
        userId: 'user-123',
        metadata: { key: 'value' },
      });

      mockErrorLogRepository.findById.mockResolvedValue(mockErrorLog);

      const response = await request(app.getHttpServer())
        .get('/error-logs/1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        errorType: 'NetworkError',
        errorMessage: 'Failed to fetch',
        stackTrace: 'Error at line 42',
        endpoint: '/api/test',
        method: 'POST',
        userId: 'user-123',
        metadata: { key: 'value' },
      });
    });

    it('should return 404 when error log not found', async () => {
      mockErrorLogRepository.findById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/error-logs/999')
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Error log with ID 999 not found',
      });
      expect(mockErrorLogRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/error-logs/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });
});
