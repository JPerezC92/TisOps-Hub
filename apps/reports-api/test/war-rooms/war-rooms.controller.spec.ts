import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, HttpException } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { WarRoomsController } from '@war-rooms/war-rooms.controller';
import { WarRoomsService } from '@war-rooms/war-rooms.service';
import { WarRoomsFactory } from './helpers/war-rooms.factory';

describe('WarRoomsController (Integration)', () => {
  let app: INestApplication;
  let mockService: MockProxy<WarRoomsService>;

  beforeEach(async () => {
    mockService = mock<WarRoomsService>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: {
            fileSize: 10 * 1024 * 1024,
          },
        }),
      ],
      controllers: [WarRoomsController],
      providers: [
        {
          provide: WarRoomsService,
          useValue: mockService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /war-rooms', () => {
    it('should return all war rooms', async () => {
      const mockResponse = WarRoomsFactory.createFindAllResponse({ count: 3 });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no war rooms exist', async () => {
      const mockResponse = { data: [], total: 0 };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should validate response structure', async () => {
      const mockResponse = WarRoomsFactory.createFindAllResponse({ count: 2 });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const record = response.body.data[0];
        expect(record).toHaveProperty('incidentId');
        expect(record).toHaveProperty('application');
        expect(record).toHaveProperty('date');
        expect(record).toHaveProperty('summary');
        expect(record).toHaveProperty('initialPriority');
        expect(record).toHaveProperty('status');
      }
    });

    it('should return war rooms with specific application', async () => {
      const mockWarRooms = WarRoomsFactory.createManyWarRooms(3, {
        application: 'FFVV',
      });
      const mockResponse = { data: mockWarRooms, total: mockWarRooms.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.application === 'FFVV')).toBe(true);
    });

    it('should return war rooms with specific priority', async () => {
      const mockWarRooms = WarRoomsFactory.createManyWarRooms(2, {
        initialPriority: 'CRITICAL',
      });
      const mockResponse = { data: mockWarRooms, total: mockWarRooms.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.initialPriority === 'CRITICAL')).toBe(true);
    });

    it('should return war rooms with specific status', async () => {
      const mockWarRooms = WarRoomsFactory.createManyWarRooms(2, {
        status: 'Closed',
      });
      const mockResponse = { data: mockWarRooms, total: mockWarRooms.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.status === 'Closed')).toBe(true);
    });
  });

  describe('POST /war-rooms/upload', () => {
    it('should upload and process Excel file successfully', async () => {
      const mockResponse = WarRoomsFactory.createUploadResponse({
        imported: 50,
        total: 50,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'war-rooms.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        message: 'File uploaded and parsed successfully',
        imported: 50,
        total: 50,
      });
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
      expect(mockService.uploadAndParse).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'No file uploaded',
      });
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

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Invalid file type'),
      });
    });

    it('should handle empty Excel file', async () => {
      mockService.uploadAndParse.mockRejectedValue(
        new HttpException('Excel file is empty', HttpStatus.BAD_REQUEST),
      );

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'empty.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(mockService.uploadAndParse).toHaveBeenCalled();
    });

    it('should process large datasets efficiently', async () => {
      const mockResponse = WarRoomsFactory.createUploadResponse({
        imported: 200,
        total: 200,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-large-excel');

      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'large-war-rooms.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.imported).toBe(200);
    });
  });

  describe('DELETE /war-rooms', () => {
    it('should delete all war rooms', async () => {
      const mockResponse = WarRoomsFactory.createDeleteResponse({
        deleted: 75,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        message: 'All war rooms deleted successfully',
        deleted: 75,
      });
      expect(mockService.deleteAll).toHaveBeenCalledOnce();
    });

    it('should handle deletion when no records exist', async () => {
      const mockResponse = WarRoomsFactory.createDeleteResponse({
        deleted: 0,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.deleted).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle records with priority changes', async () => {
      const mockWarRooms = WarRoomsFactory.createManyWarRooms(2, {
        priorityChanged: 'Yes',
      });
      const mockResponse = { data: mockWarRooms, total: mockWarRooms.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.priorityChanged === 'Yes')).toBe(true);
    });

    it('should handle records with resolution team changes', async () => {
      const mockWarRooms = WarRoomsFactory.createManyWarRooms(2, {
        resolutionTeamChanged: 'Yes',
      });
      const mockResponse = { data: mockWarRooms, total: mockWarRooms.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.resolutionTeamChanged === 'Yes')).toBe(true);
    });

    it('should handle mixed RCA status records', async () => {
      const completedRCAs = WarRoomsFactory.createManyWarRooms(2, {
        rcaStatus: 'Completed',
      });
      const pendingRCAs = WarRoomsFactory.createManyWarRooms(2, {
        rcaStatus: 'Pending',
      });
      const mockResponse = {
        data: [...completedRCAs, ...pendingRCAs],
        total: 4
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(4);
      expect(response.body.data.filter((r: any) => r.rcaStatus === 'Completed').length).toBe(2);
      expect(response.body.data.filter((r: any) => r.rcaStatus === 'Pending').length).toBe(2);
    });
  });
});
