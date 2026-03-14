import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('ApplicationRegistryController (E2E)', () => {
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

  describe('GET /application-registry', () => {
    it('should return all applications', async () => {
      const response = await request(app.getHttpServer())
        .get('/application-registry')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /application-registry/with-patterns', () => {
    it('should return all applications with patterns', async () => {
      const response = await request(app.getHttpServer())
        .get('/application-registry/with-patterns')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /application-registry/match', () => {
    it('should return null when no pattern matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/application-registry/match?name=NonExistentApp')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeNull();
    });
  });

  describe('POST /application-registry', () => {
    it('should create a new application', async () => {
      const createDto = {
        code: 'TEST',
        name: 'Test Application',
        description: 'E2E Test Application',
      };

      const response = await request(app.getHttpServer())
        .post('/application-registry')
        .send(createDto)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.code).toBe('TEST');
      expect(response.body.data.name).toBe('Test Application');
      expect(response.body.data.description).toBe('E2E Test Application');
      expect(response.body.data.isActive).toBe(true);
    });
  });

  describe('GET /application-registry/:id', () => {
    it('should return application by id', async () => {
      // First create an application
      const createResponse = await request(app.getHttpServer())
        .post('/application-registry')
        .send({
          code: 'GETID',
          name: 'Get By ID App',
        })
        .expect(201);

      const appId = createResponse.body.data.id;

      // Then get it by id
      const response = await request(app.getHttpServer())
        .get(`/application-registry/${appId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(appId);
      expect(response.body.data.code).toBe('GETID');
    });

    it('should return 404 when application not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/application-registry/99999')
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.data).toHaveProperty('message');
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/application-registry/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('PUT /application-registry/:id', () => {
    it('should update an application', async () => {
      // First create an application
      const createResponse = await request(app.getHttpServer())
        .post('/application-registry')
        .send({
          code: 'UPD',
          name: 'App to Update',
        })
        .expect(201);

      const appId = createResponse.body.data.id;

      // Then update it
      const response = await request(app.getHttpServer())
        .put(`/application-registry/${appId}`)
        .send({
          name: 'Updated App Name',
          isActive: false,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(appId);
      expect(response.body.data.name).toBe('Updated App Name');
      expect(response.body.data.isActive).toBe(false);
    });
  });

  describe('DELETE /application-registry/:id', () => {
    it('should delete an application', async () => {
      // First create an application
      const createResponse = await request(app.getHttpServer())
        .post('/application-registry')
        .send({
          code: 'DEL',
          name: 'App to Delete',
        })
        .expect(201);

      const appId = createResponse.body.data.id;

      // Then delete it
      const response = await request(app.getHttpServer())
        .delete(`/application-registry/${appId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('deleted');
      expect(response.body.data.deleted).toBe(true);
    });
  });

  describe('POST /application-registry/:id/patterns', () => {
    it('should create a pattern for an application', async () => {
      // First create an application
      const createAppResponse = await request(app.getHttpServer())
        .post('/application-registry')
        .send({
          code: 'PAT',
          name: 'App with Pattern',
        })
        .expect(201);

      const appId = createAppResponse.body.data.id;

      // Then create a pattern for it
      const response = await request(app.getHttpServer())
        .post(`/application-registry/${appId}/patterns`)
        .send({
          pattern: 'test-pattern',
          priority: 1,
          matchType: 'contains',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.applicationId).toBe(appId);
      expect(response.body.data.pattern).toBe('test-pattern');
    });
  });

  describe('DELETE /application-registry/patterns/:patternId', () => {
    it('should delete a pattern', async () => {
      // First create an application
      const createAppResponse = await request(app.getHttpServer())
        .post('/application-registry')
        .send({
          code: 'PATD',
          name: 'App with Pattern to Delete',
        })
        .expect(201);

      const appId = createAppResponse.body.data.id;

      // Then create a pattern
      const createPatternResponse = await request(app.getHttpServer())
        .post(`/application-registry/${appId}/patterns`)
        .send({
          pattern: 'pattern-to-delete',
        })
        .expect(201);

      const patternId = createPatternResponse.body.data.id;

      // Then delete the pattern
      const response = await request(app.getHttpServer())
        .delete(`/application-registry/patterns/${patternId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('deleted');
      expect(response.body.data.deleted).toBe(true);
    });
  });

  describe('Integration flow', () => {
    it('should create app, add pattern, match, update, and delete', async () => {
      // 1. Create an application
      const createAppResponse = await request(app.getHttpServer())
        .post('/application-registry')
        .send({
          code: 'INTG',
          name: 'Integration Test App',
          description: 'Testing full flow',
        })
        .expect(201);

      const appId = createAppResponse.body.data.id;
      expect(createAppResponse.body.data.code).toBe('INTG');

      // 2. Add a pattern
      const createPatternResponse = await request(app.getHttpServer())
        .post(`/application-registry/${appId}/patterns`)
        .send({
          pattern: 'integration-test',
          priority: 5,
          matchType: 'contains',
        })
        .expect(201);

      const patternId = createPatternResponse.body.data.id;
      expect(createPatternResponse.body.data.pattern).toBe('integration-test');

      // 3. Get applications with patterns
      const withPatternsResponse = await request(app.getHttpServer())
        .get('/application-registry/with-patterns')
        .expect(200);

      const createdApp = withPatternsResponse.body.data.find(
        (a: { id: number }) => a.id === appId,
      );
      expect(createdApp).toBeDefined();
      expect(createdApp.patterns).toBeDefined();

      // 4. Update the application
      const updateResponse = await request(app.getHttpServer())
        .put(`/application-registry/${appId}`)
        .send({ description: 'Updated description' })
        .expect(200);

      expect(updateResponse.body.data.description).toBe('Updated description');

      // 5. Delete the pattern
      await request(app.getHttpServer())
        .delete(`/application-registry/patterns/${patternId}`)
        .expect(200);

      // 6. Delete the application
      await request(app.getHttpServer())
        .delete(`/application-registry/${appId}`)
        .expect(200);

      // 7. Verify soft deletion (isActive should be false)
      const deletedAppResponse = await request(app.getHttpServer())
        .get(`/application-registry/${appId}`)
        .expect(200);

      expect(deletedAppResponse.body.data.isActive).toBe(false);
    });
  });
});
