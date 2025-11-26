import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('TasksController (E2E)', () => {
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

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'E2E Test Task',
        description: 'Task created by e2e test',
        priority: 'high',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('E2E Test Task');
      expect(response.body.description).toBe('Task created by e2e test');
      expect(response.body.priority).toBe('high');
      expect(response.body.completed).toBe(false);
    });

    it('should create a task with default priority', async () => {
      const createTaskDto = {
        title: 'Task with default priority',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Task with default priority');
      expect(response.body.priority).toBe('medium');
    });
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by id', async () => {
      // First create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task to get by ID' })
        .expect(201);

      const taskId = createResponse.body.id;

      // Then get it by id
      const response = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Task to get by ID');
    });

    it('should return 404 when task not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('99999');
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task', async () => {
      // First create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task to update' })
        .expect(201);

      const taskId = createResponse.body.id;

      // Then update it
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .send({ title: 'Updated Task Title', completed: true })
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Updated Task Title');
      expect(response.body.completed).toBe(true);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      // First create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task to delete' })
        .expect(201);

      const taskId = createResponse.body.id;

      // Then delete it
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(404);
    });
  });

  describe('Integration flow', () => {
    it('should create, update, and delete a task', async () => {
      // 1. Create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Integration Test Task',
          description: 'Testing full CRUD flow',
          priority: 'low',
        })
        .expect(201);

      const taskId = createResponse.body.id;
      expect(createResponse.body.title).toBe('Integration Test Task');

      // 2. Get the task
      const getResponse = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(taskId);

      // 3. Update the task
      const updateResponse = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .send({ completed: true, priority: 'high' })
        .expect(200);

      expect(updateResponse.body.completed).toBe(true);
      expect(updateResponse.body.priority).toBe('high');

      // 4. Delete the task
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(200);

      // 5. Verify deletion
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(404);
    });
  });
});
