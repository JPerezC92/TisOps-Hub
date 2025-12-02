import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('MonthlyReportStatusRegistryController (E2E)', () => {
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

  describe('GET /monthly-report-status-registry', () => {
    it('should return all status mappings', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /monthly-report-status-registry/map', () => {
    it('should map raw status to display status', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/map?status=UnknownStatus')
        .expect(200);

      expect(response.body).toHaveProperty('rawStatus');
      expect(response.body).toHaveProperty('displayStatus');
      expect(response.body.rawStatus).toBe('UnknownStatus');
    });

    it('should return fallback for unknown status', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/map?status=NonExistentStatus')
        .expect(200);

      expect(response.body.displayStatus).toBe('In L3 Backlog');
    });
  });

  describe('GET /monthly-report-status-registry/:id', () => {
    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('CRUD Integration flow', () => {
    let createdId: number;

    it('should create, read, update, and delete a status mapping', async () => {
      // 1. Create a new status mapping
      const createDto = {
        rawStatus: 'E2E Test Status',
        displayStatus: 'E2E Display Status',
        isActive: true,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/monthly-report-status-registry')
        .send(createDto)
        .expect(201);

      expect(createResponse.body).toHaveProperty('id');
      expect(createResponse.body.rawStatus).toBe('E2E Test Status');
      expect(createResponse.body.displayStatus).toBe('E2E Display Status');
      createdId = createResponse.body.id;

      // 2. Read the created status mapping
      const getResponse = await request(app.getHttpServer())
        .get(`/monthly-report-status-registry/${createdId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(createdId);
      expect(getResponse.body.rawStatus).toBe('E2E Test Status');

      // 3. Update the status mapping
      const updateDto = {
        displayStatus: 'Updated E2E Display Status',
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/monthly-report-status-registry/${createdId}`)
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.displayStatus).toBe('Updated E2E Display Status');

      // 4. Verify the map endpoint works with the new status
      const mapResponse = await request(app.getHttpServer())
        .get('/monthly-report-status-registry/map?status=E2E Test Status')
        .expect(200);

      expect(mapResponse.body.displayStatus).toBe('Updated E2E Display Status');

      // 5. Delete the status mapping (soft delete)
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/monthly-report-status-registry/${createdId}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('message');
      expect(deleteResponse.body.message).toContain('deleted successfully');

      // 6. Verify the mapping is soft deleted (isActive = false)
      const verifyResponse = await request(app.getHttpServer())
        .get(`/monthly-report-status-registry/${createdId}`)
        .expect(200);

      expect(verifyResponse.body.isActive).toBe(false);

      // 7. Verify the mapping is no longer in findAll results (filters by isActive)
      const allResponse = await request(app.getHttpServer())
        .get('/monthly-report-status-registry')
        .expect(200);

      const deletedMapping = allResponse.body.find(
        (m: { id: number }) => m.id === createdId,
      );
      expect(deletedMapping).toBeUndefined();
    });
  });
});
