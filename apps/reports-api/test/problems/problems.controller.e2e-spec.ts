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

describe('ProblemsController (e2e)', () => {
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

  describe('GET /problems', () => {
    it('should return all problems in JSend format', async () => {
      const response = await request(app.getHttpServer())
        .get('/problems')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(typeof response.body.data.total).toBe('number');
    });
  });

  describe('POST /problems/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      // Use the real Excel file from the project
      const filePath = join(__dirname, '../../files/XD PROBLEMAS NUEVOS.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', fileBuffer, {
          filename: 'XD PROBLEMAS NUEVOS.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('imported');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.imported).toBeGreaterThan(0);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });

    it('should accept .xlsx files', async () => {
      // Use the real Excel file
      const filePath = join(__dirname, '../../files/XD PROBLEMAS NUEVOS.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', fileBuffer, {
          filename: 'test.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.imported).toBeGreaterThan(0);
    });
  });

  describe('DELETE /problems', () => {
    it('should delete all problems successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete('/problems')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('deleted');
      expect(typeof response.body.data.deleted).toBe('number');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, and delete problems', async () => {
      // 1. Upload problems - use real Excel file
      const filePath = join(__dirname, '../../files/XD PROBLEMAS NUEVOS.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', fileBuffer, {
          filename: 'XD PROBLEMAS NUEVOS.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(uploadResponse.body.status).toBe('success');
      expect(uploadResponse.body.data.imported).toBeGreaterThan(0);

      // 2. Retrieve problems
      const getResponse = await request(app.getHttpServer())
        .get('/problems')
        .expect(200);

      expect(getResponse.body.status).toBe('success');
      expect(Array.isArray(getResponse.body.data.data)).toBe(true);

      // 3. Delete all problems
      const deleteResponse = await request(app.getHttpServer())
        .delete('/problems')
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');
      expect(deleteResponse.body.data.deleted).toBeGreaterThanOrEqual(0);

      // 4. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/problems')
        .expect(200);

      expect(verifyResponse.body.status).toBe('success');
      expect(verifyResponse.body.data.data).toHaveLength(0);
      expect(verifyResponse.body.data.total).toBe(0);
    });
  });
});
