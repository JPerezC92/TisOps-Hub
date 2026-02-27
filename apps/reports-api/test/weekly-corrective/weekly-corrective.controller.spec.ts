import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, HttpException } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { WeeklyCorrectiveController } from '@weekly-corrective/weekly-corrective.controller';
import { WeeklyCorrectiveService } from '@weekly-corrective/weekly-corrective.service';
import { WeeklyCorrectiveFactory } from './helpers/weekly-corrective.factory';

describe('WeeklyCorrectiveController (Integration)', () => {
  let app: INestApplication;
  let mockService: MockProxy<WeeklyCorrectiveService>;

  beforeEach(async () => {
    mockService = mock<WeeklyCorrectiveService>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: {
            fileSize: 10 * 1024 * 1024,
          },
        }),
      ],
      controllers: [WeeklyCorrectiveController],
      providers: [
        {
          provide: WeeklyCorrectiveService,
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

  describe('GET /weekly-corrective', () => {
    it('should return all weekly corrective records', async () => {
      const mockResponse = WeeklyCorrectiveFactory.createFindAllResponse({ count: 3 });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no records exist', async () => {
      const mockResponse = { data: [], total: 0 };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    it('should validate response structure', async () => {
      const mockResponse = WeeklyCorrectiveFactory.createFindAllResponse({ count: 2 });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.data)).toBe(true);

      if (response.body.data.data.length > 0) {
        const record = response.body.data.data[0];
        expect(record).toHaveProperty('requestId');
        expect(record).toHaveProperty('technician');
        expect(record).toHaveProperty('aplicativos');
        expect(record).toHaveProperty('categorizacion');
        expect(record).toHaveProperty('requestStatus');
        expect(record).toHaveProperty('priority');
      }
    });

    it('should return records with specific status', async () => {
      const mockRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(3, {
        requestStatus: 'En Pruebas',
      });
      const mockResponse = { data: mockRecords, total: mockRecords.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.every((r: any) => r.requestStatus === 'En Pruebas')).toBe(true);
    });

    it('should return records with specific priority', async () => {
      const mockRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(2, {
        priority: 'Alta',
      });
      const mockResponse = { data: mockRecords, total: mockRecords.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.every((r: any) => r.priority === 'Alta')).toBe(true);
    });
  });

  describe('POST /weekly-corrective/upload', () => {
    it('should upload and process Excel file successfully', async () => {
      const mockResponse = WeeklyCorrectiveFactory.createUploadResponse({
        imported: 35,
        total: 35,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'weekly-corrective.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        message: 'File uploaded and parsed successfully',
        imported: 35,
        total: 35,
      });
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
      expect(mockService.uploadAndParse).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'No file uploaded',
      });
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
        .post('/weekly-corrective/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'empty.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(mockService.uploadAndParse).toHaveBeenCalled();
    });

    it('should process large datasets efficiently', async () => {
      const mockResponse = WeeklyCorrectiveFactory.createUploadResponse({
        imported: 150,
        total: 150,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-large-excel');

      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'large-corrective.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.status).toBe('success');
      expect(response.body.data.imported).toBe(150);
    });
  });

  describe('DELETE /weekly-corrective', () => {
    it('should delete all weekly corrective records', async () => {
      const mockResponse = WeeklyCorrectiveFactory.createDeleteResponse({
        deleted: 45,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        message: 'All weekly corrective records deleted successfully',
        deleted: 45,
      });
      expect(mockService.deleteAll).toHaveBeenCalledOnce();
    });

    it('should handle deletion when no records exist', async () => {
      const mockResponse = WeeklyCorrectiveFactory.createDeleteResponse({
        deleted: 0,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.deleted).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle records with No asignado RCA', async () => {
      const mockRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(2, {
        rca: 'No asignado',
      });
      const mockResponse = { data: mockRecords, total: mockRecords.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.every((r: any) => r.rca === 'No asignado')).toBe(true);
    });

    it('should handle mixed priority records', async () => {
      const altaRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(2, {
        priority: 'Alta',
      });
      const bajaRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(2, {
        priority: 'Baja',
      });
      const mockResponse = {
        data: [...altaRecords, ...bajaRecords],
        total: 4
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.length).toBe(4);
      expect(response.body.data.data.filter((r: any) => r.priority === 'Alta').length).toBe(2);
      expect(response.body.data.data.filter((r: any) => r.priority === 'Baja').length).toBe(2);
    });

    it('should handle different technicians', async () => {
      const mockRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(3);
      const mockResponse = { data: mockRecords, total: mockRecords.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data.length).toBe(3);
      expect(response.body.data.data.every((r: any) => typeof r.technician === 'string')).toBe(true);
    });
  });
});
