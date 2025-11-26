import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { ApplicationRegistryController } from '@application-registry/application-registry.controller';
import { ApplicationRegistryService } from '@application-registry/application-registry.service';
import { APPLICATION_REGISTRY_REPOSITORY } from '@application-registry/domain/repositories/application-registry.repository.interface';
import type { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { GetAllApplicationsUseCase } from '@application-registry/application/use-cases/get-all-applications.use-case';
import { GetApplicationByIdUseCase } from '@application-registry/application/use-cases/get-application-by-id.use-case';
import { FindApplicationByNameUseCase } from '@application-registry/application/use-cases/find-application-by-name.use-case';
import { GetApplicationsWithPatternsUseCase } from '@application-registry/application/use-cases/get-applications-with-patterns.use-case';
import { CreateApplicationUseCase } from '@application-registry/application/use-cases/create-application.use-case';
import { UpdateApplicationUseCase } from '@application-registry/application/use-cases/update-application.use-case';
import { DeleteApplicationUseCase } from '@application-registry/application/use-cases/delete-application.use-case';
import { CreatePatternUseCase } from '@application-registry/application/use-cases/create-pattern.use-case';
import { DeletePatternUseCase } from '@application-registry/application/use-cases/delete-pattern.use-case';
import {
  ApplicationFactory,
  ApplicationPatternFactory,
  ApplicationWithPatternsFactory,
} from './helpers/application-registry.factory';

describe('ApplicationRegistryController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IApplicationRegistryRepository>;

  beforeEach(async () => {
    mockRepository = mock<IApplicationRegistryRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationRegistryController],
      providers: [
        ApplicationRegistryService,
        {
          provide: APPLICATION_REGISTRY_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: GetAllApplicationsUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new GetAllApplicationsUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: GetApplicationByIdUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new GetApplicationByIdUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: FindApplicationByNameUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new FindApplicationByNameUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: GetApplicationsWithPatternsUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new GetApplicationsWithPatternsUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: CreateApplicationUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new CreateApplicationUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: UpdateApplicationUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new UpdateApplicationUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: DeleteApplicationUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new DeleteApplicationUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: CreatePatternUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new CreatePatternUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
        {
          provide: DeletePatternUseCase,
          useFactory: (repository: IApplicationRegistryRepository) => {
            return new DeletePatternUseCase(repository);
          },
          inject: [APPLICATION_REGISTRY_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /application-registry', () => {
    it('should return all applications', async () => {
      const mockApplications = ApplicationFactory.createMany(2);

      mockRepository.findAll.mockResolvedValue(mockApplications);

      const response = await request(app.getHttpServer())
        .get('/application-registry')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: mockApplications[0].id,
        code: mockApplications[0].code,
        name: mockApplications[0].name,
      });
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no applications exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/application-registry')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('GET /application-registry/with-patterns', () => {
    it('should return applications with patterns', async () => {
      const mockApplicationsWithPatterns = ApplicationWithPatternsFactory.createMany(2);

      mockRepository.findAllWithPatterns.mockResolvedValue(mockApplicationsWithPatterns);

      const response = await request(app.getHttpServer())
        .get('/application-registry/with-patterns')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].patterns).toBeDefined();
      expect(mockRepository.findAllWithPatterns).toHaveBeenCalledOnce();
    });
  });

  describe('GET /application-registry/match', () => {
    it('should return application when pattern matches', async () => {
      const mockApplication = ApplicationFactory.create({ name: 'Test App' });

      mockRepository.findByPattern.mockResolvedValue(mockApplication);

      const response = await request(app.getHttpServer())
        .get('/application-registry/match?name=Test App')
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockApplication.id,
        name: mockApplication.name,
      });
      expect(mockRepository.findByPattern).toHaveBeenCalledWith('Test App');
    });

    it('should return null when no pattern matches', async () => {
      mockRepository.findByPattern.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/application-registry/match?name=NonExistent')
        .expect(200);

      expect(response.body).toEqual({});
      expect(mockRepository.findByPattern).toHaveBeenCalledWith('NonExistent');
    });
  });

  describe('GET /application-registry/:id', () => {
    it('should return application by id', async () => {
      const mockApplication = ApplicationFactory.create({ id: 1 });

      mockRepository.findById.mockResolvedValue(mockApplication);

      const response = await request(app.getHttpServer())
        .get('/application-registry/1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        code: mockApplication.code,
        name: mockApplication.name,
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when application not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/application-registry/999')
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Application with ID 999 not found',
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/application-registry/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('POST /application-registry', () => {
    it('should create a new application', async () => {
      const createDto = {
        code: 'TEST',
        name: 'Test Application',
        description: 'Test Description',
      };

      const expectedApplication = ApplicationFactory.create({
        id: 1,
        code: 'TEST',
        name: 'Test Application',
        description: 'Test Description',
      });

      mockRepository.create.mockResolvedValue(expectedApplication);

      const response = await request(app.getHttpServer())
        .post('/application-registry')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 1,
        code: 'TEST',
        name: 'Test Application',
        description: 'Test Description',
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PUT /application-registry/:id', () => {
    it('should update an application', async () => {
      const updateDto = {
        name: 'Updated Application',
        isActive: false,
      };

      const updatedApplication = ApplicationFactory.create({
        id: 1,
        name: 'Updated Application',
        isActive: false,
      });

      mockRepository.update.mockResolvedValue(updatedApplication);

      const response = await request(app.getHttpServer())
        .put('/application-registry/1')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        name: 'Updated Application',
        isActive: false,
      });
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .put('/application-registry/invalid')
        .send({ name: 'Updated' })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('DELETE /application-registry/:id', () => {
    it('should delete an application', async () => {
      mockRepository.delete.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/application-registry/1')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Application deleted successfully',
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .delete('/application-registry/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('POST /application-registry/:id/patterns', () => {
    it('should create a pattern for an application', async () => {
      const patternDto = {
        pattern: 'test-pattern',
        priority: 1,
        matchType: 'contains',
      };

      const expectedPattern = ApplicationPatternFactory.create({
        id: 1,
        applicationId: 1,
        pattern: 'test-pattern',
        priority: 1,
        matchType: 'contains',
      });

      mockRepository.createPattern.mockResolvedValue(expectedPattern);

      const response = await request(app.getHttpServer())
        .post('/application-registry/1/patterns')
        .send(patternDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 1,
        applicationId: 1,
        pattern: 'test-pattern',
        priority: 1,
        matchType: 'contains',
      });
      expect(mockRepository.createPattern).toHaveBeenCalledWith({
        ...patternDto,
        applicationId: 1,
      });
    });
  });

  describe('DELETE /application-registry/patterns/:patternId', () => {
    it('should delete a pattern', async () => {
      mockRepository.deletePattern.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/application-registry/patterns/1')
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Pattern deleted successfully',
      });
      expect(mockRepository.deletePattern).toHaveBeenCalledWith(1);
    });

    it('should return 400 when patternId is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .delete('/application-registry/patterns/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });
});
