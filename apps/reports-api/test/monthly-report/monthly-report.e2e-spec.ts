import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('MonthlyReportController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /monthly-report', () => {
    it('should return all monthly report records', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /monthly-report/analytics', () => {
    it('should return critical incidents analytics without filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report/analytics')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return analytics with app filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report/analytics?app=SB')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return analytics with month filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report/analytics?month=2024-10')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return analytics with both filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report/analytics?app=SB&month=2024-10')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /monthly-report/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/XD 2025 DATA INFORME MENSUAL - Current Month.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fileBuffer, {
          filename: 'XD 2025 DATA INFORME MENSUAL - Current Month.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('imported');
      expect(response.body.imported).toBeGreaterThan(0);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /monthly-report', () => {
    it('should delete all monthly report records', async () => {
      const response = await request(app.getHttpServer())
        .delete('/monthly-report')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('deleted');
      expect(typeof response.body.deleted).toBe('number');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, get analytics, and delete records', async () => {
      // 1. Upload monthly report records
      const filePath = join(__dirname, '../../files/XD 2025 DATA INFORME MENSUAL - Current Month.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fileBuffer, {
          filename: 'XD 2025 DATA INFORME MENSUAL - Current Month.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(uploadResponse.body.imported).toBeGreaterThan(0);

      // 2. Retrieve all records
      const getResponse = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(200);

      expect(Array.isArray(getResponse.body.data)).toBe(true);
      expect(getResponse.body.total).toBeGreaterThan(0);

      // 3. Get analytics data
      const analyticsResponse = await request(app.getHttpServer())
        .get('/monthly-report/analytics')
        .expect(200);

      expect(Array.isArray(analyticsResponse.body)).toBe(true);

      // 4. Delete all records
      const deleteResponse = await request(app.getHttpServer())
        .delete('/monthly-report')
        .expect(200);

      expect(deleteResponse.body.deleted).toBeGreaterThanOrEqual(0);

      // 5. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(200);

      expect(verifyResponse.body.data).toHaveLength(0);
      expect(verifyResponse.body.total).toBe(0);
    });
  });
});
