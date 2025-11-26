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

describe('RequestCategorizationController (E2E)', () => {
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

  describe('GET /request-categorization', () => {
    it('should return all request categorization records', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-categorization')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /request-categorization/summary', () => {
    it('should return category summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-categorization/summary')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /request-categorization/request-ids-by-categorization', () => {
    it('should return 400 when linkedRequestId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-categorization/request-ids-by-categorization?categorizacion=test')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('linkedRequestId');
    });

    it('should return 400 when categorizacion is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-categorization/request-ids-by-categorization?linkedRequestId=123')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('categorizacion');
    });

    it('should return request IDs when both parameters are provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-categorization/request-ids-by-categorization?linkedRequestId=123&categorizacion=test')
        .expect(200);

      expect(response.body).toHaveProperty('requestIds');
      expect(Array.isArray(response.body.requestIds)).toBe(true);
    });
  });

  describe('POST /request-categorization/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/REP001 PARA ETIQUETAR.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/request-categorization/upload')
        .attach('file', fileBuffer, {
          filename: 'REP001 PARA ETIQUETAR.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('recordsCreated');
      expect(response.body).toHaveProperty('recordsUpdated');
      expect(response.body).toHaveProperty('totalRecords');
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/request-categorization/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/request-categorization/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /request-categorization', () => {
    it('should delete all request categorization records', async () => {
      const response = await request(app.getHttpServer())
        .delete('/request-categorization')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, get summary, and delete records', async () => {
      // 1. Upload request categorization records
      const filePath = join(__dirname, '../../files/REP001 PARA ETIQUETAR.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/request-categorization/upload')
        .attach('file', fileBuffer, {
          filename: 'REP001 PARA ETIQUETAR.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(uploadResponse.body.totalRecords).toBeGreaterThanOrEqual(0);

      // 2. Retrieve records
      const getResponse = await request(app.getHttpServer())
        .get('/request-categorization')
        .expect(200);

      expect(Array.isArray(getResponse.body)).toBe(true);

      // 3. Get summary
      const summaryResponse = await request(app.getHttpServer())
        .get('/request-categorization/summary')
        .expect(200);

      expect(Array.isArray(summaryResponse.body)).toBe(true);

      // 4. Delete all records
      const deleteResponse = await request(app.getHttpServer())
        .delete('/request-categorization')
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('message');

      // 5. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/request-categorization')
        .expect(200);

      expect(verifyResponse.body).toHaveLength(0);
    });
  });
});
