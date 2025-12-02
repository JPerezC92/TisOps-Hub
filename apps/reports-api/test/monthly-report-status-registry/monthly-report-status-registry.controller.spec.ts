import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { MonthlyReportStatusRegistryController } from '@monthly-report-status-registry/monthly-report-status-registry.controller';
import { MonthlyReportStatusRegistryService } from '@monthly-report-status-registry/monthly-report-status-registry.service';
import { MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import type { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { GetAllMonthlyReportStatusesUseCase } from '@monthly-report-status-registry/application/use-cases/get-all-monthly-report-statuses.use-case';
import { GetMonthlyReportStatusByIdUseCase } from '@monthly-report-status-registry/application/use-cases/get-monthly-report-status-by-id.use-case';
import { CreateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/create-monthly-report-status.use-case';
import { UpdateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/update-monthly-report-status.use-case';
import { DeleteMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/delete-monthly-report-status.use-case';
import { MapRawStatusUseCase } from '@monthly-report-status-registry/application/use-cases/map-raw-status.use-case';
import { MonthlyReportStatusFactory } from './helpers/monthly-report-status.factory';

describe('MonthlyReportStatusRegistryController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IMonthlyReportStatusRegistryRepository>;

  beforeEach(async () => {
    mockRepository = mock<IMonthlyReportStatusRegistryRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MonthlyReportStatusRegistryController],
      providers: [
        MonthlyReportStatusRegistryService,
        {
          provide: MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: GetAllMonthlyReportStatusesUseCase,
          useFactory: (repository: IMonthlyReportStatusRegistryRepository) => {
            return new GetAllMonthlyReportStatusesUseCase(repository);
          },
          inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: GetMonthlyReportStatusByIdUseCase,
          useFactory: (repository: IMonthlyReportStatusRegistryRepository) => {
            return new GetMonthlyReportStatusByIdUseCase(repository);
          },
          inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: CreateMonthlyReportStatusUseCase,
          useFactory: (repository: IMonthlyReportStatusRegistryRepository) => {
            return new CreateMonthlyReportStatusUseCase(repository);
          },
          inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: UpdateMonthlyReportStatusUseCase,
          useFactory: (repository: IMonthlyReportStatusRegistryRepository) => {
            return new UpdateMonthlyReportStatusUseCase(repository);
          },
          inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: DeleteMonthlyReportStatusUseCase,
          useFactory: (repository: IMonthlyReportStatusRegistryRepository) => {
            return new DeleteMonthlyReportStatusUseCase(repository);
          },
          inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: MapRawStatusUseCase,
          useFactory: (repository: IMonthlyReportStatusRegistryRepository) => {
            return new MapRawStatusUseCase(repository);
          },
          inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /monthly-report-status-registry', () => {
    it('should return all status mappings', async () => {
      const mockStatuses = MonthlyReportStatusFactory.createMany(3);

      mockRepository.findAll.mockResolvedValue(mockStatuses);

      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toMatchObject({
        id: mockStatuses[0].id,
        rawStatus: mockStatuses[0].rawStatus,
        displayStatus: mockStatuses[0].displayStatus,
      });
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no status mappings exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('GET /monthly-report-status-registry/map', () => {
    it('should return mapped display status when raw status is found', async () => {
      const mockStatus = MonthlyReportStatusFactory.create({
        rawStatus: 'Pendiente',
        displayStatus: 'In L3 Backlog',
      });

      mockRepository.findByRawStatus.mockResolvedValue(mockStatus);

      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/map?status=Pendiente')
        .expect(200);

      expect(response.body).toMatchObject({
        rawStatus: 'Pendiente',
        displayStatus: 'In L3 Backlog',
      });
      expect(mockRepository.findByRawStatus).toHaveBeenCalledWith('Pendiente');
    });

    it('should return fallback "In L3 Backlog" when raw status is not found', async () => {
      mockRepository.findByRawStatus.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/map?status=UnknownStatus')
        .expect(200);

      expect(response.body).toMatchObject({
        rawStatus: 'UnknownStatus',
        displayStatus: 'In L3 Backlog',
      });
      expect(mockRepository.findByRawStatus).toHaveBeenCalledWith('UnknownStatus');
    });
  });

  describe('GET /monthly-report-status-registry/:id', () => {
    it('should return status mapping by id', async () => {
      const mockStatus = MonthlyReportStatusFactory.create({ id: 1 });

      mockRepository.findById.mockResolvedValue(mockStatus);

      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        rawStatus: mockStatus.rawStatus,
        displayStatus: mockStatus.displayStatus,
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when status mapping not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/999')
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Monthly report status with ID 999 not found',
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('POST /monthly-report-status-registry', () => {
    it('should create a new status mapping', async () => {
      const createDto = {
        rawStatus: 'Nuevo',
        displayStatus: 'New',
        isActive: true,
      };

      const expectedStatus = MonthlyReportStatusFactory.create({
        id: 1,
        rawStatus: 'Nuevo',
        displayStatus: 'New',
        isActive: true,
      });

      mockRepository.create.mockResolvedValue(expectedStatus);

      const response = await request(app.getHttpServer())
        .post('/monthly-report-status-registry')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 1,
        rawStatus: 'Nuevo',
        displayStatus: 'New',
        isActive: true,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PUT /monthly-report-status-registry/:id', () => {
    it('should update a status mapping', async () => {
      const updateDto = {
        displayStatus: 'Updated Display',
        isActive: false,
      };

      const updatedStatus = MonthlyReportStatusFactory.create({
        id: 1,
        displayStatus: 'Updated Display',
        isActive: false,
      });

      mockRepository.update.mockResolvedValue(updatedStatus);

      const response = await request(app.getHttpServer())
        .put('/monthly-report-status-registry/1')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        displayStatus: 'Updated Display',
        isActive: false,
      });
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .put('/monthly-report-status-registry/invalid')
        .send({ displayStatus: 'Updated' })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('DELETE /monthly-report-status-registry/:id', () => {
    it('should delete a status mapping', async () => {
      mockRepository.delete.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/monthly-report-status-registry/1')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Monthly report status mapping deleted successfully',
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .delete('/monthly-report-status-registry/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });
});
