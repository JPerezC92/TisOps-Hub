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

describe('RequestTagsController (E2E)', () => {
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

  describe('GET /request-tags', () => {
    it('should return all request tags', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /request-tags/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/REP01 XD TAG 2025.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .attach('file', fileBuffer, {
          filename: 'REP01 XD TAG 2025.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('imported');
      expect(response.body.imported).toBeGreaterThan(0);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('GET /request-tags/by-additional-info', () => {
    it('should return 400 when info query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?linkedRequestId=123')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('info');
    });

    it('should return 400 when linkedRequestId query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=test')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('linkedRequestId');
    });

    it('should return request IDs when both parameters are provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=test&linkedRequestId=123')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /request-tags/missing-ids', () => {
    it('should return 400 when linkedRequestId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('linkedRequestId');
    });

    it('should return missing IDs when linkedRequestId is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids?linkedRequestId=123')
        .expect(200);

      expect(response.body).toHaveProperty('missingIds');
      expect(Array.isArray(response.body.missingIds)).toBe(true);
    });
  });

  describe('DELETE /request-tags', () => {
    it('should delete all request tags', async () => {
      const response = await request(app.getHttpServer())
        .delete('/request-tags')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('deleted');
      expect(typeof response.body.deleted).toBe('number');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, query, and delete request tags', async () => {
      // 1. Upload request tags
      const filePath = join(__dirname, '../../files/REP01 XD TAG 2025.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .attach('file', fileBuffer, {
          filename: 'REP01 XD TAG 2025.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(uploadResponse.body.imported).toBeGreaterThan(0);

      // 2. Retrieve request tags
      const getResponse = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(Array.isArray(getResponse.body.data)).toBe(true);
      expect(getResponse.body.total).toBeGreaterThan(0);

      // 3. Delete all request tags
      const deleteResponse = await request(app.getHttpServer())
        .delete('/request-tags')
        .expect(200);

      expect(deleteResponse.body.deleted).toBeGreaterThanOrEqual(0);

      // 4. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(verifyResponse.body.data).toHaveLength(0);
      expect(verifyResponse.body.total).toBe(0);
    });
  });
});
