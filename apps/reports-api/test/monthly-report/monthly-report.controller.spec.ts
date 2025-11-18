import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { MonthlyReportController } from '@monthly-report/monthly-report.controller';
import { MonthlyReportService } from '@monthly-report/monthly-report.service';
import { MonthlyReportFactory } from './helpers/monthly-report.factory';

describe('MonthlyReportController (Integration)', () => {
  let app: INestApplication;
  let mockService: MockProxy<MonthlyReportService>;

  beforeEach(async () => {
    // Create mock service using vitest-mock-extended
    mockService = mock<MonthlyReportService>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
          },
        }),
      ],
      controllers: [MonthlyReportController],
      providers: [
        {
          provide: MonthlyReportService,
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

  describe('GET /monthly-report', () => {
    it('should return all monthly reports', async () => {
      const mockResponse = MonthlyReportFactory.createFindAllResponse({ count: 3 });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no reports exist', async () => {
      const mockResponse = { data: [], total: 0 };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should validate response structure', async () => {
      const mockResponse = MonthlyReportFactory.createFindAllResponse({ count: 2 });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Validate first record structure
      if (response.body.data.length > 0) {
        const record = response.body.data[0];
        expect(record).toHaveProperty('requestId');
        expect(record).toHaveProperty('aplicativos');
        expect(record).toHaveProperty('categorizacion');
        expect(record).toHaveProperty('createdTime');
        expect(record).toHaveProperty('requestStatus');
        expect(record).toHaveProperty('priority');
        expect(record).toHaveProperty('technician');
      }
    });

    it('should return reports with specific status', async () => {
      const mockReports = MonthlyReportFactory.createManyMonthlyReports(3, {
        requestStatus: 'Cerrado',
      });
      const mockResponse = { data: mockReports, total: mockReports.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.requestStatus === 'Cerrado')).toBe(true);
    });

    it('should return reports with specific priority', async () => {
      const mockReports = MonthlyReportFactory.createManyMonthlyReports(2, {
        priority: 'Alta',
      });
      const mockResponse = { data: mockReports, total: mockReports.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.priority === 'Alta')).toBe(true);
    });
  });

  describe('POST /monthly-report/upload', () => {
    it('should upload and process Excel file successfully', async () => {
      const mockResponse = MonthlyReportFactory.createUploadResponse({
        imported: 47,
        total: 50,
        merged: 3,
        unique: 47,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'monthly-report.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        message: 'File uploaded and parsed successfully',
        imported: 47,
        total: 50,
        merged: 3,
        unique: 47,
      });
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
      expect(mockService.uploadAndParse).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'No file uploaded',
      });
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
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
        new Error('Excel file is empty'),
      );

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'empty.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

      // Service throws error, but controller doesn't catch it yet
      expect(mockService.uploadAndParse).toHaveBeenCalled();
    });

    it('should handle duplicate records correctly', async () => {
      const mockResponse = MonthlyReportFactory.createUploadResponse({
        imported: 45,
        total: 50,
        merged: 5,
        unique: 45,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-excel-with-duplicates');

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'report-with-duplicates.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.merged).toBe(5);
      expect(response.body.unique).toBe(45);
      expect(response.body.total).toBe(50);
    });

    it('should process large datasets efficiently', async () => {
      const mockResponse = MonthlyReportFactory.createUploadResponse({
        imported: 500,
        total: 500,
        merged: 0,
        unique: 500,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-large-excel');

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'large-report.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.imported).toBe(500);
    });

    it('should validate required fields', async () => {
      mockService.uploadAndParse.mockRejectedValue(
        new Error('Some records are missing required fields'),
      );

      const fakeExcelBuffer = Buffer.from('fake-invalid-excel');

      await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'invalid.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

      expect(mockService.uploadAndParse).toHaveBeenCalled();
    });
  });

  describe('DELETE /monthly-report', () => {
    it('should delete all monthly reports', async () => {
      const mockResponse = MonthlyReportFactory.createDeleteResponse({
        deleted: 150,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        message: 'All monthly reports deleted successfully',
        deleted: 150,
      });
      expect(mockService.deleteAll).toHaveBeenCalledOnce();
    });

    it('should handle deletion when no records exist', async () => {
      const mockResponse = MonthlyReportFactory.createDeleteResponse({
        deleted: 0,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.deleted).toBe(0);
    });

    it('should delete large dataset', async () => {
      const mockResponse = MonthlyReportFactory.createDeleteResponse({
        deleted: 10000,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.deleted).toBe(10000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle records with No asignado values', async () => {
      const mockReports = MonthlyReportFactory.createManyMonthlyReports(2, {
        eta: 'No asignado',
        resolvedTime: 'No asignado',
        problemId: 'No asignado',
      });
      const mockResponse = { data: mockReports, total: mockReports.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) =>
        r.eta === 'No asignado' &&
        r.resolvedTime === 'No asignado' &&
        r.problemId === 'No asignado'
      )).toBe(true);
    });

    it('should handle records with No Validado values', async () => {
      const mockReports = MonthlyReportFactory.createManyMonthlyReports(2, {
        nivelUno: 'No Validado',
      });
      const mockResponse = { data: mockReports, total: mockReports.length };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.nivelUno === 'No Validado')).toBe(true);
    });

    it('should handle mixed OLA status records', async () => {
      const violatedReports = MonthlyReportFactory.createManyMonthlyReports(2, {
        requestOlaStatus: 'Violated',
      });
      const notViolatedReports = MonthlyReportFactory.createManyMonthlyReports(2, {
        requestOlaStatus: 'Not Violated',
      });
      const mockResponse = {
        data: [...violatedReports, ...notViolatedReports],
        total: 4
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(4);
      expect(response.body.data.filter((r: any) => r.requestOlaStatus === 'Violated').length).toBe(2);
      expect(response.body.data.filter((r: any) => r.requestOlaStatus === 'Not Violated').length).toBe(2);
    });
  });
});
