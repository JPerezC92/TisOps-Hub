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

describe('WeeklyCorrectiveController (E2E)', () => {
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

  describe('GET /weekly-corrective', () => {
    it('should return all weekly-corrective records', async () => {
      const response = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /weekly-corrective/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/XD SEMANAL CORRECTIVO.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .attach('file', fileBuffer, {
          filename: 'XD SEMANAL CORRECTIVO.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('imported');
      expect(response.body.imported).toBeGreaterThan(0);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /weekly-corrective', () => {
    it('should delete all weekly-corrective records', async () => {
      const response = await request(app.getHttpServer())
        .delete('/weekly-corrective')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('deleted');
      expect(typeof response.body.deleted).toBe('number');
    });
  });

  describe('GET /weekly-corrective/l3-tickets-by-status', () => {
    it('should return L3 tickets by status data', async () => {
      const response = await request(app.getHttpServer())
        .get('/weekly-corrective/l3-tickets-by-status')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('statusColumns');
      expect(response.body).toHaveProperty('monthName');
      expect(response.body).toHaveProperty('totalL3Tickets');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(Array.isArray(response.body.statusColumns)).toBe(true);
    });

    it('should return L3 tickets by status with app filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/weekly-corrective/l3-tickets-by-status?app=SB')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('statusColumns');
    });

    it('should return L3 tickets by status with month filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/weekly-corrective/l3-tickets-by-status?month=2024-10')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('monthName');
    });

    it('should return L3 tickets by status with both filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/weekly-corrective/l3-tickets-by-status?app=SB&month=2024-10')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('statusColumns');
      expect(response.body).toHaveProperty('monthName');
      expect(response.body).toHaveProperty('totalL3Tickets');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, and delete weekly-corrective records', async () => {
      // 1. Upload weekly-corrective
      const filePath = join(__dirname, '../../files/XD SEMANAL CORRECTIVO.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/weekly-corrective/upload')
        .attach('file', fileBuffer, {
          filename: 'XD SEMANAL CORRECTIVO.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(uploadResponse.body.imported).toBeGreaterThan(0);

      // 2. Retrieve weekly-corrective records
      const getResponse = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(200);

      expect(Array.isArray(getResponse.body.data)).toBe(true);

      // 3. Delete all weekly-corrective records
      const deleteResponse = await request(app.getHttpServer())
        .delete('/weekly-corrective')
        .expect(200);

      expect(deleteResponse.body.deleted).toBeGreaterThanOrEqual(0);

      // 4. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/weekly-corrective')
        .expect(200);

      expect(verifyResponse.body.data).toHaveLength(0);
      expect(verifyResponse.body.total).toBe(0);
    });
  });
});
