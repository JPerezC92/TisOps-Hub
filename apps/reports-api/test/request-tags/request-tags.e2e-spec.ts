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
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { DatabaseExceptionFilter } from '@error-logs/infrastructure/filters/database-exception.filter';

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

    // Register global filters (same as main.ts)
    const databaseExceptionFilter = app.get(DatabaseExceptionFilter);
    const domainErrorFilter = new DomainErrorFilter();
    app.useGlobalFilters(databaseExceptionFilter, domainErrorFilter);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /request-tags', () => {
    it('should return all request tags with JSend success format', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('tags');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.tags)).toBe(true);
    });
  });

  describe('POST /request-tags/upload', () => {
    it('should upload and parse Excel file with JSend success format', async () => {
      const filePath = join(__dirname, '../../files/REP01 XD TAG 2025.xlsx');
      const fileBuffer = readFileSync(filePath);

      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .attach('file', fileBuffer, {
          filename: 'REP01 XD TAG 2025.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('imported');
      expect(response.body.data).toHaveProperty('skipped');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.imported).toBeGreaterThan(0);
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.data.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/request-tags/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.data.message).toContain('Invalid file type');
    });
  });

  describe('GET /request-tags/by-additional-info', () => {
    it('should return 400 when info query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?linkedRequestId=123')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.data.message).toContain('info');
    });

    it('should return 400 when linkedRequestId query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=test')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.data.message).toContain('linkedRequestId');
    });

    it('should return request IDs with JSend success format when both parameters are provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/by-additional-info?info=test&linkedRequestId=123')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('requestIds');
      expect(Array.isArray(response.body.data.requestIds)).toBe(true);
    });
  });

  describe('GET /request-tags/missing-ids', () => {
    it('should return 400 when linkedRequestId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.data.message).toContain('linkedRequestId');
    });

    it('should return missing IDs with JSend success format when linkedRequestId is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/request-tags/missing-ids?linkedRequestId=123')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('missingIds');
      expect(Array.isArray(response.body.data.missingIds)).toBe(true);
    });
  });

  describe('POST /request-tags', () => {
    const validRequestTag = {
      requestId: 'REQ-E2E-001',
      createdTime: '2024-01-15T10:00:00Z',
      informacionAdicional: 'Asignado',
      modulo: 'IT',
      problemId: 'PROB001',
      linkedRequestId: 'REQ-LINKED-001',
      jira: 'JIRA-123',
      categorizacion: 'Incident',
      technician: 'John Doe',
    };

    it('should create a new request tag and return 201 with JSend success', async () => {
      // First, ensure the tag doesn't exist by deleting all
      await request(app.getHttpServer()).delete('/request-tags');

      const response = await request(app.getHttpServer())
        .post('/request-tags')
        .send(validRequestTag)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('requestId', validRequestTag.requestId);
    });

    it('should return 409 with JSend fail when request tag already exists', async () => {
      // First create the tag
      await request(app.getHttpServer()).delete('/request-tags');
      await request(app.getHttpServer())
        .post('/request-tags')
        .send(validRequestTag)
        .expect(201);

      // Try to create the same tag again
      const response = await request(app.getHttpServer())
        .post('/request-tags')
        .send(validRequestTag)
        .expect(409);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('code', 'REQUEST_TAG_ALREADY_EXISTS');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toContain(validRequestTag.requestId);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidRequestTag = {
        requestId: 'REQ-INVALID',
        // Missing createdTime and other required fields
      };

      const response = await request(app.getHttpServer())
        .post('/request-tags')
        .send(invalidRequestTag)
        .expect(400);

      // Validation errors go through DatabaseExceptionFilter -> JSend format
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.data).toHaveProperty('message');
    });

    it('should create tag with optional fields', async () => {
      await request(app.getHttpServer()).delete('/request-tags');

      const tagWithOptionalFields = {
        ...validRequestTag,
        requestId: 'REQ-E2E-002',
        requestIdLink: 'https://example.com/REQ-E2E-002',
        linkedRequestIdLink: 'https://example.com/REQ-LINKED-001',
      };

      const response = await request(app.getHttpServer())
        .post('/request-tags')
        .send(tagWithOptionalFields)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.requestIdLink).toBe(tagWithOptionalFields.requestIdLink);
      expect(response.body.data.linkedRequestIdLink).toBe(tagWithOptionalFields.linkedRequestIdLink);
    });
  });

  describe('DELETE /request-tags', () => {
    it('should delete all request tags with JSend success format', async () => {
      const response = await request(app.getHttpServer())
        .delete('/request-tags')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('deleted');
      expect(typeof response.body.data.deleted).toBe('number');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, query, and delete request tags with JSend format', async () => {
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

      expect(uploadResponse.body.status).toBe('success');
      expect(uploadResponse.body.data.imported).toBeGreaterThan(0);

      // 2. Retrieve request tags
      const getResponse = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(getResponse.body.status).toBe('success');
      expect(Array.isArray(getResponse.body.data.tags)).toBe(true);
      expect(getResponse.body.data.total).toBeGreaterThan(0);

      // 3. Delete all request tags
      const deleteResponse = await request(app.getHttpServer())
        .delete('/request-tags')
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');
      expect(deleteResponse.body.data.deleted).toBeGreaterThanOrEqual(0);

      // 4. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/request-tags')
        .expect(200);

      expect(verifyResponse.body.status).toBe('success');
      expect(verifyResponse.body.data.tags).toHaveLength(0);
      expect(verifyResponse.body.data.total).toBe(0);
    });
  });
});
