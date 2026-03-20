import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { WeeklyCorrectiveController } from '@weekly-corrective/infrastructure/weekly-corrective.controller';
import { WEEKLY_CORRECTIVE_REPOSITORY } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import { GetAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/get-all-weekly-correctives.use-case';
import { DeleteAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/delete-all-weekly-correctives.use-case';
import { UploadAndParseWeeklyCorrectiveUseCase } from '@weekly-corrective/application/use-cases/upload-and-parse-weekly-corrective.use-case';
import { GetL3TicketsByStatusUseCase } from '@weekly-corrective/application/use-cases/get-l3-tickets-by-status.use-case';
import { WeeklyCorrectiveExcelParser } from '@weekly-corrective/infrastructure/parsers/weekly-corrective-excel.parser';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { WeeklyCorrectiveFactory } from './helpers/weekly-corrective.factory';

describe('WeeklyCorrectiveController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IWeeklyCorrectiveRepository>;

  beforeEach(async () => {
    mockRepository = mock<IWeeklyCorrectiveRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: { fileSize: 10 * 1024 * 1024 },
        }),
      ],
      controllers: [WeeklyCorrectiveController],
      providers: [
        WeeklyCorrectiveExcelParser,
        {
          provide: WEEKLY_CORRECTIVE_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: GetAllWeeklyCorrectivesUseCase,
          useFactory: (repo: IWeeklyCorrectiveRepository) => new GetAllWeeklyCorrectivesUseCase(repo),
          inject: [WEEKLY_CORRECTIVE_REPOSITORY],
        },
        {
          provide: DeleteAllWeeklyCorrectivesUseCase,
          useFactory: (repo: IWeeklyCorrectiveRepository) => new DeleteAllWeeklyCorrectivesUseCase(repo),
          inject: [WEEKLY_CORRECTIVE_REPOSITORY],
        },
        {
          provide: UploadAndParseWeeklyCorrectiveUseCase,
          useFactory: (repo: IWeeklyCorrectiveRepository) => new UploadAndParseWeeklyCorrectiveUseCase(repo),
          inject: [WEEKLY_CORRECTIVE_REPOSITORY],
        },
        {
          provide: GetL3TicketsByStatusUseCase,
          useFactory: (repo: IWeeklyCorrectiveRepository) => new GetL3TicketsByStatusUseCase(repo),
          inject: [WEEKLY_CORRECTIVE_REPOSITORY],
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

  describe('GET /weekly-corrective', () => {
    it('should return all weekly corrective records', async () => {
      const mockData = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(3);
      mockRepository.findAll.mockResolvedValue(mockData);
      mockRepository.countAll.mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
    });

    it('should return empty array when no records exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.countAll.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('POST /weekly-corrective/upload', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .attach('file', fakeBuffer, {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /weekly-corrective', () => {
    it('should delete all weekly corrective records', async () => {
      mockRepository.deleteAll.mockResolvedValue(45);

      const response = await request(app.getHttpServer())
        .delete('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });

    it('should handle deletion when no records exist', async () => {
      mockRepository.deleteAll.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .delete('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /weekly-corrective/l3-tickets-by-status', () => {
    it('should return L3 tickets by status', async () => {
      const mockResult = {
        data: [],
        statusColumns: ['Dev in Progress', 'In Backlog'],
        monthName: 'Jan',
        totalL3Tickets: 0,
      };
      mockRepository.findL3TicketsByStatus.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective/l3-tickets-by-status')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });

    it('should pass query parameters', async () => {
      const mockResult = {
        data: [],
        statusColumns: [],
        monthName: 'Feb',
        totalL3Tickets: 0,
      };
      mockRepository.findL3TicketsByStatus.mockResolvedValue(mockResult);

      await request(app.getHttpServer())
        .get('/weekly-corrective/l3-tickets-by-status?app=FFVV&month=2025-02')
        .expect(HttpStatus.OK);

      expect(mockRepository.findL3TicketsByStatus).toHaveBeenCalledWith('FFVV', '2025-02');
    });
  });
});
