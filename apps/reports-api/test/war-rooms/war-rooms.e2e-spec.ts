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

describe('WarRoomsController (E2E)', () => {
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

  describe('GET /war-rooms', () => {
    it('should return all war rooms records with JSend format', async () => {
      const response = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });
  });

  describe('GET /war-rooms/analytics', () => {
    it('should return analytics data without filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should return analytics data with app filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics?app=SB')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should return analytics data with month filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics?month=2024-10')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should return analytics data with both filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/war-rooms/analytics?app=SB&month=2024-10')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });
  });

  describe('POST /war-rooms/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      const filePath = join(__dirname, '../../files/EDWarRooms2025.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .attach('file', fileBuffer, {
          filename: 'EDWarRooms2025.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('imported');
      expect(response.body.data.imported).toBeGreaterThan(0);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /war-rooms', () => {
    it('should delete all war rooms records', async () => {
      const response = await request(app.getHttpServer())
        .delete('/war-rooms')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('deleted');
      expect(typeof response.body.data.deleted).toBe('number');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, get analytics, and delete records', async () => {
      // 1. Upload war rooms records
      const filePath = join(__dirname, '../../files/EDWarRooms2025.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/war-rooms/upload')
        .attach('file', fileBuffer, {
          filename: 'EDWarRooms2025.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(uploadResponse.body.status).toBe('success');
      expect(uploadResponse.body.data.imported).toBeGreaterThan(0);

      // 2. Retrieve all records
      const getResponse = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(200);

      expect(getResponse.body.status).toBe('success');
      expect(Array.isArray(getResponse.body.data.data)).toBe(true);
      expect(getResponse.body.data.total).toBeGreaterThan(0);

      // 3. Get analytics data
      const analyticsResponse = await request(app.getHttpServer())
        .get('/war-rooms/analytics')
        .expect(200);

      expect(analyticsResponse.body.status).toBe('success');
      expect(analyticsResponse.body.data).toHaveProperty('data');
      expect(Array.isArray(analyticsResponse.body.data.data)).toBe(true);

      // 4. Delete all records
      const deleteResponse = await request(app.getHttpServer())
        .delete('/war-rooms')
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');
      expect(deleteResponse.body.data.deleted).toBeGreaterThanOrEqual(0);

      // 5. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/war-rooms')
        .expect(200);

      expect(verifyResponse.body.status).toBe('success');
      expect(verifyResponse.body.data.data).toHaveLength(0);
      expect(verifyResponse.body.data.total).toBe(0);
    });
  });
});
