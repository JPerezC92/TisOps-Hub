import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('ModuleRegistryController (E2E)', () => {
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

  describe('GET /module-registry', () => {
    it('should return all modules', async () => {
      const response = await request(app.getHttpServer())
        .get('/module-registry')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter modules by application query param', async () => {
      // Create a module for a specific application
      await request(app.getHttpServer())
        .post('/module-registry')
        .send({ sourceValue: 'APP_FILTER_MODULE', displayValue: 'App Filter Module', application: 'TestApp' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/module-registry?application=TestApp')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((m: { application: string }) => m.application === 'TestApp')).toBe(true);
    });
  });

  describe('GET /module-registry/:id', () => {
    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/module-registry/99999')
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.data).toHaveProperty('message');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .get('/module-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('CRUD Integration flow', () => {
    let createdId: number;

    it('should create, read, update, and delete a module', async () => {
      // 1. Create
      const createResponse = await request(app.getHttpServer())
        .post('/module-registry')
        .send({ sourceValue: 'E2E Module Source', displayValue: 'E2E Module Display', application: 'E2EApp' })
        .expect(201);

      expect(createResponse.body.status).toBe('success');
      expect(createResponse.body.data).toHaveProperty('id');
      expect(createResponse.body.data.sourceValue).toBe('E2E Module Source');
      expect(createResponse.body.data.displayValue).toBe('E2E Module Display');
      expect(createResponse.body.data.application).toBe('E2EApp');
      expect(createResponse.body.data.isActive).toBe(true);
      createdId = createResponse.body.data.id;

      // 2. Read by id
      const getResponse = await request(app.getHttpServer())
        .get(`/module-registry/${createdId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('success');
      expect(getResponse.body.data.id).toBe(createdId);

      // 3. Appears in findAll
      const allResponse = await request(app.getHttpServer())
        .get('/module-registry')
        .expect(200);

      const found = allResponse.body.data.find((m: { id: number }) => m.id === createdId);
      expect(found).toBeDefined();
      expect(found.sourceValue).toBe('E2E Module Source');

      // 4. Appears in findByApplication
      const byAppResponse = await request(app.getHttpServer())
        .get('/module-registry?application=E2EApp')
        .expect(200);

      const foundByApp = byAppResponse.body.data.find((m: { id: number }) => m.id === createdId);
      expect(foundByApp).toBeDefined();

      // 5. Update
      const updateResponse = await request(app.getHttpServer())
        .put(`/module-registry/${createdId}`)
        .send({ displayValue: 'Updated E2E Module Display' })
        .expect(200);

      expect(updateResponse.body.status).toBe('success');
      expect(updateResponse.body.data.displayValue).toBe('Updated E2E Module Display');
      expect(updateResponse.body.data.sourceValue).toBe('E2E Module Source'); // unchanged

      // 6. Delete (soft delete)
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/module-registry/${createdId}`)
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');
      expect(deleteResponse.body.data).toHaveProperty('deleted');
      expect(deleteResponse.body.data.deleted).toBe(true);

      // 7. Still findable by id (isActive = false)
      const afterDeleteResponse = await request(app.getHttpServer())
        .get(`/module-registry/${createdId}`)
        .expect(200);

      expect(afterDeleteResponse.body.status).toBe('success');
      expect(afterDeleteResponse.body.data.isActive).toBe(false);
    });
  });

  describe('POST /module-registry', () => {
    it('should default isActive to true', async () => {
      const response = await request(app.getHttpServer())
        .post('/module-registry')
        .send({ sourceValue: 'Default Active Module', displayValue: 'Default Active', application: 'DefaultApp' })
        .expect(201);

      expect(response.body.data.isActive).toBe(true);
    });
  });

  describe('PUT /module-registry/:id', () => {
    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .put('/module-registry/invalid')
        .send({ displayValue: 'Updated' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /module-registry/:id', () => {
    it('should return 400 for invalid id', async () => {
      const response = await request(app.getHttpServer())
        .delete('/module-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
