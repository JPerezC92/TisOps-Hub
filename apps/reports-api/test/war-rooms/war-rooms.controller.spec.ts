import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { WarRoomsController } from '@war-rooms/infrastructure/war-rooms.controller';
import { WAR_ROOMS_REPOSITORY } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import { GetAllWarRoomsUseCase } from '@war-rooms/application/use-cases/get-all-war-rooms.use-case';
import { DeleteAllWarRoomsUseCase } from '@war-rooms/application/use-cases/delete-all-war-rooms.use-case';
import { UploadAndParseWarRoomsUseCase } from '@war-rooms/application/use-cases/upload-and-parse-war-rooms.use-case';
import { WarRoomsExcelParser } from '@war-rooms/infrastructure/parsers/war-rooms-excel.parser';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { WarRoomsFactory } from './helpers/war-rooms.factory';

describe('WarRoomsController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IWarRoomsRepository>;

  beforeEach(async () => {
    mockRepository = mock<IWarRoomsRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: { fileSize: 10 * 1024 * 1024 },
        }),
      ],
      controllers: [WarRoomsController],
      providers: [
        WarRoomsExcelParser,
        {
          provide: WAR_ROOMS_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: GetAllWarRoomsUseCase,
          useFactory: (repo: IWarRoomsRepository) => new GetAllWarRoomsUseCase(repo),
          inject: [WAR_ROOMS_REPOSITORY],
        },
        {
          provide: DeleteAllWarRoomsUseCase,
          useFactory: (repo: IWarRoomsRepository) => new DeleteAllWarRoomsUseCase(repo),
          inject: [WAR_ROOMS_REPOSITORY],
        },
        {
          provide: UploadAndParseWarRoomsUseCase,
          useFactory: (repo: IWarRoomsRepository) => new UploadAndParseWarRoomsUseCase(repo),
          inject: [WAR_ROOMS_REPOSITORY],
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

  describe('GET /war-rooms', () => {
    it('should return all war rooms with JSend format', async () => {
      const mockData = WarRoomsFactory.createManyWarRooms(3);
      mockRepository.findAllWithApplication.mockResolvedValue(mockData);
      mockRepository.countAll.mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
    });

    it('should return empty array when no war rooms exist', async () => {
      mockRepository.findAllWithApplication.mockResolvedValue([]);
      mockRepository.countAll.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('GET /war-rooms/analytics', () => {
    it('should return filtered war rooms by app', async () => {
      const mockData = WarRoomsFactory.createManyWarRooms(3);
      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(mockData);
      mockRepository.countFiltered.mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics?app=FFVV')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalledWith('FFVV', undefined);
    });

    it('should return filtered war rooms by month', async () => {
      const mockData = WarRoomsFactory.createManyWarRooms(5);
      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(mockData);
      mockRepository.countFiltered.mockResolvedValue(5);

      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics?month=2025-01')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(5);
      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalledWith(undefined, '2025-01');
    });

    it('should return filtered war rooms by both app and month', async () => {
      const mockData = WarRoomsFactory.createManyWarRooms(2);
      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(mockData);
      mockRepository.countFiltered.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics?app=B2B&month=2025-02')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(2);
      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalledWith('B2B', '2025-02');
    });

    it('should handle no filters', async () => {
      const mockData = WarRoomsFactory.createManyWarRooms(10);
      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(mockData);
      mockRepository.countFiltered.mockResolvedValue(10);

      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(10);
      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('POST /war-rooms/upload', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .attach('file', fakeBuffer, {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /war-rooms', () => {
    it('should delete all war rooms', async () => {
      mockRepository.deleteAll.mockResolvedValue(75);

      const response = await request(app.getHttpServer())
        .delete('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });

    it('should handle deletion when no records exist', async () => {
      mockRepository.deleteAll.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .delete('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });
  });
});
