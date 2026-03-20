import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { SessionsOrdersController } from '@sessions-orders/infrastructure/sessions-orders.controller';
import { SESSIONS_ORDERS_REPOSITORY } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import { GetAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/get-all-sessions-orders.use-case';
import { DeleteAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/delete-all-sessions-orders.use-case';
import { UploadAndParseSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/upload-and-parse-sessions-orders.use-case';
import { GetLast30DaysUseCase } from '@sessions-orders/application/use-cases/get-last-30-days.use-case';
import { GetIncidentsVsOrdersByMonthUseCase } from '@sessions-orders/application/use-cases/get-incidents-vs-orders-by-month.use-case';
import { SessionsOrdersExcelParser } from '@sessions-orders/infrastructure/parsers/sessions-orders-excel.parser';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { SessionsOrdersFactory } from './helpers/sessions-orders.factory';

describe('SessionsOrdersController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<ISessionsOrdersRepository>;

  beforeEach(async () => {
    mockRepository = mock<ISessionsOrdersRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: { fileSize: 10 * 1024 * 1024 },
        }),
      ],
      controllers: [SessionsOrdersController],
      providers: [
        SessionsOrdersExcelParser,
        {
          provide: SESSIONS_ORDERS_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: GetAllSessionsOrdersUseCase,
          useFactory: (repo: ISessionsOrdersRepository) => new GetAllSessionsOrdersUseCase(repo),
          inject: [SESSIONS_ORDERS_REPOSITORY],
        },
        {
          provide: DeleteAllSessionsOrdersUseCase,
          useFactory: (repo: ISessionsOrdersRepository) => new DeleteAllSessionsOrdersUseCase(repo),
          inject: [SESSIONS_ORDERS_REPOSITORY],
        },
        {
          provide: UploadAndParseSessionsOrdersUseCase,
          useFactory: (repo: ISessionsOrdersRepository) => new UploadAndParseSessionsOrdersUseCase(repo),
          inject: [SESSIONS_ORDERS_REPOSITORY],
        },
        {
          provide: GetLast30DaysUseCase,
          useFactory: (repo: ISessionsOrdersRepository) => new GetLast30DaysUseCase(repo),
          inject: [SESSIONS_ORDERS_REPOSITORY],
        },
        {
          provide: GetIncidentsVsOrdersByMonthUseCase,
          useFactory: (repo: ISessionsOrdersRepository) => new GetIncidentsVsOrdersByMonthUseCase(repo),
          inject: [SESSIONS_ORDERS_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await app.close();
  });

  describe('GET /sessions-orders', () => {
    it('should return all sessions orders with releases', async () => {
      const mockData = SessionsOrdersFactory.createManySessionsOrders(3);
      const mockReleases = SessionsOrdersFactory.createManyReleases(2);

      mockRepository.findAllMain.mockResolvedValue(mockData);
      mockRepository.findAllReleases.mockResolvedValue(mockReleases);
      mockRepository.countMain.mockResolvedValue(3);
      mockRepository.countReleases.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.releases).toHaveLength(2);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.totalReleases).toBe(2);
    });

    it('should return empty arrays when no data exists', async () => {
      mockRepository.findAllMain.mockResolvedValue([]);
      mockRepository.findAllReleases.mockResolvedValue([]);
      mockRepository.countMain.mockResolvedValue(0);
      mockRepository.countReleases.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.releases).toEqual([]);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.totalReleases).toBe(0);
    });
  });

  describe('POST /sessions-orders/upload', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fakeBuffer, {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /sessions-orders', () => {
    it('should delete all sessions orders and releases', async () => {
      mockRepository.deleteAllMain.mockResolvedValue(510);
      mockRepository.deleteAllReleases.mockResolvedValue(35);

      const response = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        message: 'All sessions/orders records deleted successfully',
        deletedMain: 510,
        deletedReleases: 35,
      });
    });

    it('should handle deletion when no records exist', async () => {
      mockRepository.deleteAllMain.mockResolvedValue(0);
      mockRepository.deleteAllReleases.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.deletedMain).toBe(0);
      expect(response.body.data.deletedReleases).toBe(0);
    });
  });

  describe('GET /sessions-orders/last-30-days', () => {
    it('should return last 30 days data', async () => {
      const mockResult = {
        data: [
          { day: 'Day 1', date: '2025-01-01', incidents: 5, sessions: 100, placedOrders: 50 },
          { day: 'Day 2', date: '2025-01-02', incidents: 3, sessions: 120, placedOrders: 60 },
        ],
      };

      mockRepository.findLast30Days.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders/last-30-days')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.data[0]).toMatchObject({
        day: 'Day 1',
        date: '2025-01-01',
        incidents: 5,
        sessions: 100,
        placedOrders: 50,
      });
    });
  });

  describe('GET /sessions-orders/incidents-vs-orders-by-month', () => {
    it('should return incidents vs orders by month', async () => {
      const mockResult = {
        data: [
          { month: 'Jan', monthNumber: 1, incidents: 10, placedOrders: 200 },
          { month: 'Feb', monthNumber: 2, incidents: 15, placedOrders: 180 },
        ],
      };

      mockRepository.findIncidentsVsOrdersByMonth.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders/incidents-vs-orders-by-month')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.data[0]).toMatchObject({
        month: 'Jan',
        monthNumber: 1,
        incidents: 10,
        placedOrders: 200,
      });
    });

    it('should pass year parameter when provided', async () => {
      const mockResult = { data: [] };
      mockRepository.findIncidentsVsOrdersByMonth.mockResolvedValue(mockResult);

      await request(app.getHttpServer())
        .get('/sessions-orders/incidents-vs-orders-by-month?year=2024')
        .expect(HttpStatus.OK);

      expect(mockRepository.findIncidentsVsOrdersByMonth).toHaveBeenCalledWith(2024);
    });
  });
});
