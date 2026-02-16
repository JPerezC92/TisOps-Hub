import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { CorrectiveStatusRegistryController } from '@corrective-status-registry/corrective-status-registry.controller';
import { CorrectiveStatusRegistryService } from '@corrective-status-registry/corrective-status-registry.service';
import { CORRECTIVE_STATUS_REGISTRY_REPOSITORY } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import type { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { GetAllCorrectiveStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-all-corrective-statuses.use-case';
import { GetCorrectiveStatusByIdUseCase } from '@corrective-status-registry/application/use-cases/get-corrective-status-by-id.use-case';
import { CreateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/create-corrective-status.use-case';
import { UpdateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/update-corrective-status.use-case';
import { DeleteCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/delete-corrective-status.use-case';
import { GetDistinctDisplayStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-distinct-display-statuses.use-case';
import { CorrectiveStatusFactory } from './helpers/corrective-status.factory';

describe('CorrectiveStatusRegistryController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<ICorrectiveStatusRegistryRepository>;

  beforeEach(async () => {
    mockRepository = mock<ICorrectiveStatusRegistryRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CorrectiveStatusRegistryController],
      providers: [
        CorrectiveStatusRegistryService,
        {
          provide: CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: GetAllCorrectiveStatusesUseCase,
          useFactory: (repository: ICorrectiveStatusRegistryRepository) => {
            return new GetAllCorrectiveStatusesUseCase(repository);
          },
          inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: GetCorrectiveStatusByIdUseCase,
          useFactory: (repository: ICorrectiveStatusRegistryRepository) => {
            return new GetCorrectiveStatusByIdUseCase(repository);
          },
          inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: CreateCorrectiveStatusUseCase,
          useFactory: (repository: ICorrectiveStatusRegistryRepository) => {
            return new CreateCorrectiveStatusUseCase(repository);
          },
          inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: UpdateCorrectiveStatusUseCase,
          useFactory: (repository: ICorrectiveStatusRegistryRepository) => {
            return new UpdateCorrectiveStatusUseCase(repository);
          },
          inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: DeleteCorrectiveStatusUseCase,
          useFactory: (repository: ICorrectiveStatusRegistryRepository) => {
            return new DeleteCorrectiveStatusUseCase(repository);
          },
          inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
        },
        {
          provide: GetDistinctDisplayStatusesUseCase,
          useFactory: (repository: ICorrectiveStatusRegistryRepository) => {
            return new GetDistinctDisplayStatusesUseCase(repository);
          },
          inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /corrective-status-registry', () => {
    it('should return all status mappings', async () => {
      const mockStatuses = CorrectiveStatusFactory.createMany(3);

      mockRepository.findAll.mockResolvedValue(mockStatuses);

      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toMatchObject({
        id: mockStatuses[0].id,
        rawStatus: mockStatuses[0].rawStatus,
        displayStatus: mockStatuses[0].displayStatus,
      });
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no status mappings exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('GET /corrective-status-registry/display-statuses', () => {
    it('should return distinct display statuses', async () => {
      const mockDisplayStatuses = [
        'Development in Progress',
        'In Backlog',
        'In Testing',
        'Production Deployment',
      ];

      mockRepository.findDistinctDisplayStatuses.mockResolvedValue(mockDisplayStatuses);

      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/display-statuses')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(mockDisplayStatuses);
      expect(response.body.data).toHaveLength(4);
      expect(mockRepository.findDistinctDisplayStatuses).toHaveBeenCalledOnce();
    });

    it('should return empty array when no display statuses exist', async () => {
      mockRepository.findDistinctDisplayStatuses.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/display-statuses')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual([]);
      expect(mockRepository.findDistinctDisplayStatuses).toHaveBeenCalledOnce();
    });
  });

  describe('GET /corrective-status-registry/:id', () => {
    it('should return status mapping by id', async () => {
      const mockStatus = CorrectiveStatusFactory.create({ id: 1 });

      mockRepository.findById.mockResolvedValue(mockStatus);

      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        rawStatus: mockStatus.rawStatus,
        displayStatus: mockStatus.displayStatus,
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when status mapping not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/999')
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Corrective status with ID 999 not found',
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('POST /corrective-status-registry', () => {
    it('should create a new status mapping', async () => {
      const createDto = {
        rawStatus: 'Dev in Progress',
        displayStatus: 'Development in Progress',
        isActive: true,
      };

      const expectedStatus = CorrectiveStatusFactory.create({
        id: 1,
        rawStatus: 'Dev in Progress',
        displayStatus: 'Development in Progress',
        isActive: true,
      });

      mockRepository.create.mockResolvedValue(expectedStatus);

      const response = await request(app.getHttpServer())
        .post('/corrective-status-registry')
        .send(createDto)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        rawStatus: 'Dev in Progress',
        displayStatus: 'Development in Progress',
        isActive: true,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PUT /corrective-status-registry/:id', () => {
    it('should update a status mapping', async () => {
      const updateDto = {
        displayStatus: 'Updated Display',
        isActive: false,
      };

      const updatedStatus = CorrectiveStatusFactory.create({
        id: 1,
        displayStatus: 'Updated Display',
        isActive: false,
      });

      mockRepository.update.mockResolvedValue(updatedStatus);

      const response = await request(app.getHttpServer())
        .put('/corrective-status-registry/1')
        .send(updateDto)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        displayStatus: 'Updated Display',
        isActive: false,
      });
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .put('/corrective-status-registry/invalid')
        .send({ displayStatus: 'Updated' })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('DELETE /corrective-status-registry/:id', () => {
    it('should delete a status mapping', async () => {
      mockRepository.delete.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/corrective-status-registry/1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        deleted: true,
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .delete('/corrective-status-registry/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });
});
