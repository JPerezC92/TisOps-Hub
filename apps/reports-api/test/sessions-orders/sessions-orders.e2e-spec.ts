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

describe('SessionsOrdersController (E2E)', () => {
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

  describe('GET /sessions-orders', () => {
    it('should return all sessions-orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /sessions-orders/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/SB INCIDENTES ORDENES SESIONES.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fileBuffer, {
          filename: 'SB INCIDENTES ORDENES SESIONES.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('importedMain');
      expect(response.body).toHaveProperty('importedReleases');
      expect(response.body.importedMain).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /sessions-orders', () => {
    it('should delete all sessions-orders', async () => {
      const response = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('deletedMain');
      expect(response.body).toHaveProperty('deletedReleases');
      expect(typeof response.body.deletedMain).toBe('number');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, and delete sessions-orders', async () => {
      // 1. Upload sessions-orders
      const filePath = join(__dirname, '../../files/SB INCIDENTES ORDENES SESIONES.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/sessions-orders/upload')
        .attach('file', fileBuffer, {
          filename: 'SB INCIDENTES ORDENES SESIONES.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(uploadResponse.body.importedMain).toBeGreaterThanOrEqual(0);

      // 2. Retrieve sessions-orders
      const getResponse = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(200);

      expect(Array.isArray(getResponse.body.data)).toBe(true);

      // 3. Delete all sessions-orders
      const deleteResponse = await request(app.getHttpServer())
        .delete('/sessions-orders')
        .expect(200);

      expect(deleteResponse.body.deletedMain).toBeGreaterThanOrEqual(0);

      // 4. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/sessions-orders')
        .expect(200);

      expect(verifyResponse.body.data).toHaveLength(0);
      expect(verifyResponse.body.total).toBe(0);
    });
  });
});
