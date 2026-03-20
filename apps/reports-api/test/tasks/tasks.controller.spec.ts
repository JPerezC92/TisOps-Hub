import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { TasksController } from '@tasks/infrastructure/tasks.controller';
import { TASK_REPOSITORY } from '@tasks/domain/repositories/task.repository.interface';
import type { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';
import { TaskFactory } from './helpers/task.factory';

describe('TasksController (Integration)', () => {
  let app: INestApplication;
  let mockTaskRepository: MockProxy<ITaskRepository>;

  beforeEach(async () => {
    mockTaskRepository = mock<ITaskRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TASK_REPOSITORY,
          useValue: mockTaskRepository,
        },
        {
          provide: GetAllTasksUseCase,
          useFactory: (repo: ITaskRepository) => new GetAllTasksUseCase(repo),
          inject: [TASK_REPOSITORY],
        },
        {
          provide: GetTaskByIdUseCase,
          useFactory: (repo: ITaskRepository) => new GetTaskByIdUseCase(repo),
          inject: [TASK_REPOSITORY],
        },
        {
          provide: CreateTaskUseCase,
          useFactory: (repo: ITaskRepository) => new CreateTaskUseCase(repo),
          inject: [TASK_REPOSITORY],
        },
        {
          provide: UpdateTaskUseCase,
          useFactory: (repo: ITaskRepository) => new UpdateTaskUseCase(repo),
          inject: [TASK_REPOSITORY],
        },
        {
          provide: DeleteTaskUseCase,
          useFactory: (repo: ITaskRepository) => new DeleteTaskUseCase(repo),
          inject: [TASK_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = TaskFactory.createMany(2);
      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        id: mockTasks[0].id,
        title: mockTasks[0].title,
        priority: mockTasks[0].priority,
        completed: mockTasks[0].completed,
      });
      expect(mockTaskRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no tasks exist', async () => {
      mockTaskRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual([]);
      expect(mockTaskRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by id', async () => {
      const mockTask = TaskFactory.create({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        completed: false,
      });

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const response = await request(app.getHttpServer())
        .get('/tasks/1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        completed: false,
      });
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/tasks/999')
        .expect(404);

      expect(response.body).toMatchObject({
        status: 'fail',
        data: {
          message: 'Task with ID 999 not found',
          code: ERROR_CODES.TASK_NOT_FOUND,
        },
      });
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
      };

      const expectedTask = TaskFactory.create({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        completed: false,
      });

      mockTaskRepository.create.mockResolvedValue(expectedTask);

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        completed: false,
      });
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          description: 'Test Description',
          priority: 'high',
          completed: false,
        }),
      );
    });

    it('should create a task with default priority when not provided', async () => {
      const createTaskDto = { title: 'Test Task' };

      const expectedTask = TaskFactory.create({
        id: 1,
        title: 'Test Task',
        description: null,
        priority: 'medium',
        completed: false,
      });

      mockTaskRepository.create.mockResolvedValue(expectedTask);

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        title: 'Test Task',
        priority: 'medium',
        completed: false,
      });
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task', async () => {
      const updateTaskDto = {
        title: 'Updated Task',
        completed: true,
      };

      const existingTask = TaskFactory.create({ id: 1 });
      const updatedTask = TaskFactory.create({
        id: 1,
        title: 'Updated Task',
        description: 'Original Description',
        priority: 'high',
        completed: true,
      });

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const response = await request(app.getHttpServer())
        .patch('/tasks/1')
        .send(updateTaskDto)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: 1,
        title: 'Updated Task',
        completed: true,
      });
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Updated Task',
          completed: true,
        }),
      );
    });

    it('should return 404 when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .patch('/tasks/999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body).toMatchObject({
        status: 'fail',
        data: {
          message: 'Task with ID 999 not found',
          code: ERROR_CODES.TASK_NOT_FOUND,
        },
      });
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .patch('/tasks/invalid')
        .send({ title: 'Updated' })
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const existingTask = TaskFactory.create({ id: 1 });
      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete('/tasks/1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        deleted: true,
      });
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .delete('/tasks/999')
        .expect(404);

      expect(response.body).toMatchObject({
        status: 'fail',
        data: {
          message: 'Task with ID 999 not found',
          code: ERROR_CODES.TASK_NOT_FOUND,
        },
      });
    });

    it('should return 400 when id is not a valid number', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tasks/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });
});
