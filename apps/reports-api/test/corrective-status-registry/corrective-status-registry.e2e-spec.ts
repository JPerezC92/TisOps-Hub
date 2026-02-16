import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('CorrectiveStatusRegistryController (E2E)', () => {
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

  describe('GET /corrective-status-registry', () => {
    it('should return all status mappings', async () => {
      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /corrective-status-registry/display-statuses', () => {
    it('should return distinct display statuses', async () => {
      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/display-statuses')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /corrective-status-registry/:id', () => {
    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .get('/corrective-status-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('CRUD Integration flow', () => {
    let createdId: number;

    it('should create, read, update, and delete a status mapping', async () => {
      // 1. Create a new status mapping
      const createDto = {
        rawStatus: 'E2E Test Raw Status',
        displayStatus: 'E2E Test Display Status',
        isActive: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/corrective-status-registry')
        .send(createDto)
        .expect(201);

      expect(createResponse.body.status).toBe('success');
      expect(createResponse.body.data).toHaveProperty('id');
      expect(createResponse.body.data.rawStatus).toBe('E2E Test Raw Status');
      expect(createResponse.body.data.displayStatus).toBe('E2E Test Display Status');
      expect(createResponse.body.data.isActive).toBe(true);
      createdId = createResponse.body.data.id;

      // 2. Read the created status mapping
      const getResponse = await request(app.getHttpServer())
        .get(`/corrective-status-registry/${createdId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('success');
      expect(getResponse.body.data.id).toBe(createdId);
      expect(getResponse.body.data.rawStatus).toBe('E2E Test Raw Status');
      expect(getResponse.body.data.displayStatus).toBe('E2E Test Display Status');

      // 3. Verify it appears in findAll results
      const allResponse = await request(app.getHttpServer())
        .get('/corrective-status-registry')
        .expect(200);

      expect(allResponse.body.status).toBe('success');
      const foundMapping = allResponse.body.data.find(
        (m: { id: number }) => m.id === createdId,
      );
      expect(foundMapping).toBeDefined();
      expect(foundMapping.rawStatus).toBe('E2E Test Raw Status');

      // 4. Verify it appears in display-statuses
      const displayStatusesResponse = await request(app.getHttpServer())
        .get('/corrective-status-registry/display-statuses')
        .expect(200);

      expect(displayStatusesResponse.body.status).toBe('success');
      expect(displayStatusesResponse.body.data).toContain('E2E Test Display Status');

      // 5. Update the status mapping
      const updateDto = {
        displayStatus: 'Updated E2E Display Status',
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/corrective-status-registry/${createdId}`)
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.status).toBe('success');
      expect(updateResponse.body.data.displayStatus).toBe('Updated E2E Display Status');
      expect(updateResponse.body.data.rawStatus).toBe('E2E Test Raw Status'); // unchanged

      // 6. Delete the status mapping (soft delete)
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/corrective-status-registry/${createdId}`)
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');
      expect(deleteResponse.body.data).toHaveProperty('deleted');
      expect(deleteResponse.body.data.deleted).toBe(true);

      // 7. Verify the mapping is soft deleted (isActive = false)
      const verifyResponse = await request(app.getHttpServer())
        .get(`/corrective-status-registry/${createdId}`)
        .expect(200);

      expect(verifyResponse.body.status).toBe('success');
      expect(verifyResponse.body.data.isActive).toBe(false);

      // 8. Verify the mapping is no longer in findAll results (filters by isActive)
      const allAfterDeleteResponse = await request(app.getHttpServer())
        .get('/corrective-status-registry')
        .expect(200);

      expect(allAfterDeleteResponse.body.status).toBe('success');
      const deletedMapping = allAfterDeleteResponse.body.data.find(
        (m: { id: number }) => m.id === createdId,
      );
      expect(deletedMapping).toBeUndefined();
    });
  });

  describe('POST /corrective-status-registry', () => {
    it('should create a status mapping with minimal fields', async () => {
      const createDto = {
        rawStatus: 'Minimal Test Status',
        displayStatus: 'Minimal Display',
      };

      const response = await request(app.getHttpServer())
        .post('/corrective-status-registry')
        .send(createDto)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.rawStatus).toBe('Minimal Test Status');
      expect(response.body.data.displayStatus).toBe('Minimal Display');
      expect(response.body.data.isActive).toBe(true); // default value
    });
  });

  describe('PUT /corrective-status-registry/:id', () => {
    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .put('/corrective-status-registry/invalid')
        .send({ displayStatus: 'Updated' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /corrective-status-registry/:id', () => {
    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .delete('/corrective-status-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
