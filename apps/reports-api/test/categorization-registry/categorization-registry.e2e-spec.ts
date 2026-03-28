import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('CategorizationRegistryController (E2E)', () => {
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

  describe('GET /categorization-registry', () => {
    it('should return all categorizations', async () => {
      const response = await request(app.getHttpServer())
        .get('/categorization-registry')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /categorization-registry/:id', () => {
    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/categorization-registry/99999')
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.data).toHaveProperty('message');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .get('/categorization-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('CRUD Integration flow', () => {
    let createdId: number;

    it('should create, read, update, and delete a categorization', async () => {
      // 1. Create
      const createResponse = await request(app.getHttpServer())
        .post('/categorization-registry')
        .send({ sourceValue: 'E2E Source', displayValue: 'E2E Display' })
        .expect(201);

      expect(createResponse.body.status).toBe('success');
      expect(createResponse.body.data).toHaveProperty('id');
      expect(createResponse.body.data.sourceValue).toBe('E2E Source');
      expect(createResponse.body.data.displayValue).toBe('E2E Display');
      expect(createResponse.body.data.isActive).toBe(true);
      createdId = createResponse.body.data.id;

      // 2. Read by id
      const getResponse = await request(app.getHttpServer())
        .get(`/categorization-registry/${createdId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('success');
      expect(getResponse.body.data.id).toBe(createdId);

      // 3. Appears in findAll
      const allResponse = await request(app.getHttpServer())
        .get('/categorization-registry')
        .expect(200);

      const found = allResponse.body.data.find((c: { id: number }) => c.id === createdId);
      expect(found).toBeDefined();
      expect(found.sourceValue).toBe('E2E Source');

      // 4. Update
      const updateResponse = await request(app.getHttpServer())
        .put(`/categorization-registry/${createdId}`)
        .send({ displayValue: 'Updated E2E Display' })
        .expect(200);

      expect(updateResponse.body.status).toBe('success');
      expect(updateResponse.body.data.displayValue).toBe('Updated E2E Display');
      expect(updateResponse.body.data.sourceValue).toBe('E2E Source'); // unchanged

      // 5. Delete (soft delete)
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/categorization-registry/${createdId}`)
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');
      expect(deleteResponse.body.data).toHaveProperty('deleted');
      expect(deleteResponse.body.data.deleted).toBe(true);

      // 6. Still findable by id (soft deleted — isActive = false)
      const afterDeleteResponse = await request(app.getHttpServer())
        .get(`/categorization-registry/${createdId}`)
        .expect(200);

      expect(afterDeleteResponse.body.status).toBe('success');
      expect(afterDeleteResponse.body.data.isActive).toBe(false);
    });
  });

  describe('POST /categorization-registry', () => {
    it('should default isActive to true', async () => {
      const response = await request(app.getHttpServer())
        .post('/categorization-registry')
        .send({ sourceValue: 'Default Active', displayValue: 'Default Active Display' })
        .expect(201);

      expect(response.body.data.isActive).toBe(true);
    });
  });

  describe('PUT /categorization-registry/:id', () => {
    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .put('/categorization-registry/invalid')
        .send({ displayValue: 'Updated' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /categorization-registry/:id', () => {
    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .delete('/categorization-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
