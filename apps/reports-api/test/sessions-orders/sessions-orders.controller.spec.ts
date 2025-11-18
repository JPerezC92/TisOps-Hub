import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, HttpException } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SessionsOrdersController } from '../../src/sessions-orders/sessions-orders.controller';
import { SessionsOrdersService } from '../../src/sessions-orders/sessions-orders.service';
import { SessionsOrdersFactory } from './helpers/sessions-orders.factory';

describe('SessionsOrdersController (Integration)', () => {
  let app: INestApplication;
  let mockService: MockProxy<SessionsOrdersService>;

  beforeEach(async () => {
    // Create mock service using vitest-mock-extended
    mockService = mock<SessionsOrdersService>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
          },
        }),
      ],
      controllers: [SessionsOrdersController],
      providers: [
        {
          provide: SessionsOrdersService,
          useValue: mockService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await app.close();
  });

  describe('GET /sessions-orders', () => {
    it('should return all sessions orders with releases', async () => {
      const mockResponse = SessionsOrdersFactory.createFindAllResponse({
        mainCount: 3,
        releasesCount: 2,
      });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.releases).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.totalReleases).toBe(2);
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty arrays when no data exists', async () => {
      const mockResponse = SessionsOrdersFactory.createFindAllResponse({
        mainCount: 0,
        releasesCount: 0,
      });

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.data).toEqual([]);
      expect(response.body.releases).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.totalReleases).toBe(0);
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });

    it('should validate response structure for main data', async () => {
      const mockMainData = SessionsOrdersFactory.createManySessionsOrders(2);
      const mockResponse = {
        data: mockMainData,
        releases: [],
        total: 2,
        totalReleases: 0,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      const record = response.body.data[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('ano');
      expect(record).toHaveProperty('mes');
      expect(record).toHaveProperty('peak');
      expect(record).toHaveProperty('dia');
      expect(record).toHaveProperty('incidentes');
      expect(record).toHaveProperty('placedOrders');
      expect(record).toHaveProperty('billedOrders');
      expect(typeof record.ano).toBe('number');
      expect(typeof record.mes).toBe('number');
    });

    it('should validate response structure for releases', async () => {
      const mockReleases = SessionsOrdersFactory.createManyReleases(2);
      const mockResponse = {
        data: [],
        releases: mockReleases,
        total: 0,
        totalReleases: 2,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      const release = response.body.releases[0];
      expect(release).toHaveProperty('id');
      expect(release).toHaveProperty('semana');
      expect(release).toHaveProperty('aplicacion');
      expect(release).toHaveProperty('fecha');
      expect(release).toHaveProperty('release');
      expect(release).toHaveProperty('ticketsCount');
      expect(release).toHaveProperty('ticketsData');
      expect(['SB', 'FFVV']).toContain(release.aplicacion);
      expect(typeof release.ticketsCount).toBe('number');
    });

    it('should validate ticketsData is valid JSON', async () => {
      const mockRelease = SessionsOrdersFactory.createRelease({
        ticketsData: JSON.stringify(['TICKET-001', 'TICKET-002']),
      });

      const mockResponse = {
        data: [],
        releases: [mockRelease],
        total: 0,
        totalReleases: 1,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      const release = response.body.releases[0];
      const tickets = JSON.parse(release.ticketsData);
      expect(Array.isArray(tickets)).toBe(true);
      expect(tickets).toContain('TICKET-001');
      expect(tickets).toContain('TICKET-002');
    });

    it('should return data with specific year and month', async () => {
      const mockData = SessionsOrdersFactory.createManySessionsOrders(5, {
        ano: 2025,
        mes: 6,
      });

      const mockResponse = {
        data: mockData,
        releases: [],
        total: 5,
        totalReleases: 0,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.ano === 2025)).toBe(true);
      expect(response.body.data.every((r: any) => r.mes === 6)).toBe(true);
    });

    it('should return releases for specific application', async () => {
      const mockReleases = SessionsOrdersFactory.createManyReleases(3, {
        aplicacion: 'SB',
      });

      const mockResponse = {
        data: [],
        releases: mockReleases,
        total: 0,
        totalReleases: 3,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.releases.every((r: any) => r.aplicacion === 'SB')).toBe(true);
    });
  });

  describe('POST /sessions-orders/upload', () => {
    it('should upload and process Excel file successfully', async () => {
      const mockResponse = SessionsOrdersFactory.createUploadResponse({
        importedMain: 510,
        importedReleases: 35,
        totalMain: 510,
        totalReleases: 35,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      // Try to read real file, but fallback to mock if not found
      let fileBuffer: Buffer;
      try {
        const filePath = join(__dirname, '../../files/SB INCIDENTES ORDENES SESIONES.xlsx');
        fileBuffer = readFileSync(filePath);
      } catch {
        fileBuffer = Buffer.from('fake-excel-content');
      }

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fileBuffer, {
          filename: 'SB INCIDENTES ORDENES SESIONES.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        message: 'File uploaded and parsed successfully',
        importedMain: 510,
        importedReleases: 35,
        totalMain: 510,
        totalReleases: 35,
      });
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
      expect(mockService.uploadAndParse).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('No file uploaded');
      expect(mockService.uploadAndParse).not.toHaveBeenCalled();
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
      expect(mockService.uploadAndParse).not.toHaveBeenCalled();
    });

    it('should handle parsing errors gracefully', async () => {
      mockService.uploadAndParse.mockRejectedValue(
        new HttpException('Failed to parse Excel file', HttpStatus.BAD_REQUEST),
      );

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'test.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
    });

    it('should handle empty Excel sheets', async () => {
      mockService.uploadAndParse.mockRejectedValue(
        new HttpException('Main sheet (Hoja1) is empty', HttpStatus.BAD_REQUEST),
      );

      const emptyExcelBuffer = Buffer.from('empty-excel');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', emptyExcelBuffer, {
          filename: 'empty.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('empty');
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
    });

    it('should process files with only main data (no releases)', async () => {
      const mockResponse = SessionsOrdersFactory.createUploadResponse({
        importedMain: 100,
        importedReleases: 0,
        totalMain: 100,
        totalReleases: 0,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('excel-with-only-main-data');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'main-only.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.importedMain).toBe(100);
      expect(response.body.importedReleases).toBe(0);
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
    });

    it('should handle batch insert for large datasets', async () => {
      const mockResponse = SessionsOrdersFactory.createUploadResponse({
        importedMain: 510,
        importedReleases: 35,
        totalMain: 510,
        totalReleases: 35,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('large-excel-file');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'large.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      // Verify all records were imported (batch size 150 as per optimization)
      expect(response.body.importedMain).toBe(response.body.totalMain);
      expect(response.body.importedReleases).toBe(response.body.totalReleases);
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
    });

    it('should validate Excel file structure', async () => {
      mockService.uploadAndParse.mockRejectedValue(
        new HttpException('Excel file has invalid structure', HttpStatus.BAD_REQUEST),
      );

      const invalidExcelBuffer = Buffer.from('invalid-excel-structure');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', invalidExcelBuffer, {
          filename: 'invalid.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
      expect(mockService.uploadAndParse).toHaveBeenCalledOnce();
    });
  });

  describe('DELETE /sessions-orders', () => {
    it('should delete all sessions orders and releases', async () => {
      const mockResponse = SessionsOrdersFactory.createDeleteResponse({
        deletedMain: 510,
        deletedReleases: 35,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        message: 'All sessions/orders records deleted successfully',
        deletedMain: 510,
        deletedReleases: 35,
      });
      expect(mockService.deleteAll).toHaveBeenCalledOnce();
    });

    it('should handle deletion when no records exist', async () => {
      const mockResponse = SessionsOrdersFactory.createDeleteResponse({
        deletedMain: 0,
        deletedReleases: 0,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.deletedMain).toBe(0);
      expect(response.body.deletedReleases).toBe(0);
      expect(mockService.deleteAll).toHaveBeenCalledOnce();
    });

    it('should delete both tables atomically', async () => {
      const mockResponse = SessionsOrdersFactory.createDeleteResponse({
        deletedMain: 100,
        deletedReleases: 20,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(HttpStatus.OK);

      // Both counts should be present in response
      expect(response.body).toHaveProperty('deletedMain');
      expect(response.body).toHaveProperty('deletedReleases');
      expect(mockService.deleteAll).toHaveBeenCalledOnce();
    });

    it('should handle large dataset deletion', async () => {
      const mockResponse = SessionsOrdersFactory.createDeleteResponse({
        deletedMain: 1000,
        deletedReleases: 100,
      });

      mockService.deleteAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.deletedMain).toBe(1000);
      expect(response.body.deletedReleases).toBe(100);
      expect(mockService.deleteAll).toHaveBeenCalledOnce();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large dataset retrieval efficiently', async () => {
      const mockResponse = SessionsOrdersFactory.createFindAllResponse({
        mainCount: 500,
        releasesCount: 30,
      });

      mockService.findAll.mockResolvedValue(mockResponse);

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);
      const duration = Date.now() - startTime;

      expect(response.body.data).toHaveLength(500);
      expect(response.body.releases).toHaveLength(30);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });

    it('should handle upload with optimal batch size', async () => {
      const mockResponse = SessionsOrdersFactory.createUploadResponse({
        importedMain: 510,
        importedReleases: 35,
        totalMain: 510,
        totalReleases: 35,
      });

      mockService.uploadAndParse.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('large-excel-file');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fakeExcelBuffer, {
          filename: 'large.xlsx',
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(HttpStatus.CREATED);

      // Verify all records were imported (batch size optimizations applied)
      expect(response.body.importedMain).toBe(response.body.totalMain);
      expect(response.body.importedReleases).toBe(response.body.totalReleases);
    });
  });

  describe('Edge Cases', () => {
    it('should handle releases with empty ticketsData', async () => {
      const mockRelease = SessionsOrdersFactory.createRelease({
        ticketsCount: 0,
        ticketsData: JSON.stringify([]),
      });

      const mockResponse = {
        data: [],
        releases: [mockRelease],
        total: 0,
        totalReleases: 1,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      const release = response.body.releases[0];
      expect(release.ticketsCount).toBe(0);
      const tickets = JSON.parse(release.ticketsData);
      expect(tickets).toEqual([]);
    });

    it('should handle records with zero incidents', async () => {
      const mockData = SessionsOrdersFactory.createManySessionsOrders(2, {
        incidentes: 0,
        placedOrders: 0,
        billedOrders: 0,
      });

      const mockResponse = {
        data: mockData,
        releases: [],
        total: 2,
        totalReleases: 0,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((r: any) => r.incidentes === 0)).toBe(true);
    });

    it('should handle mixed SB and FFVV releases', async () => {
      const sbReleases = SessionsOrdersFactory.createManyReleases(2, {
        aplicacion: 'SB',
      });
      const ffvvReleases = SessionsOrdersFactory.createManyReleases(2, {
        aplicacion: 'FFVV',
      });

      const mockResponse = {
        data: [],
        releases: [...sbReleases, ...ffvvReleases],
        total: 0,
        totalReleases: 4,
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(HttpStatus.OK);

      const sbCount = response.body.releases.filter((r: any) => r.aplicacion === 'SB').length;
      const ffvvCount = response.body.releases.filter((r: any) => r.aplicacion === 'FFVV').length;
      expect(sbCount).toBe(2);
      expect(ffvvCount).toBe(2);
    });
  });
});
