import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { TasksController } from '@tasks/tasks.controller';
import { TasksService } from '@tasks/tasks.service';
import { TASK_REPOSITORY } from '@tasks/domain/repositories/task.repository.interface';
import type { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';
import { TaskFactory } from './helpers/task.factory';

describe('TasksController (Integration)', () => {
  let app: INestApplication;
  let mockTaskRepository: MockProxy<ITaskRepository>;

  beforeEach(async () => {
    // Create mock repository using vitest-mock-extended
    mockTaskRepository = mock<ITaskRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        // Mock repository
        {
          provide: TASK_REPOSITORY,
          useValue: mockTaskRepository,
        },
        // Use Cases with factory providers
        {
          provide: GetAllTasksUseCase,
          useFactory: (taskRepository: ITaskRepository) => {
            return new GetAllTasksUseCase(taskRepository);
          },
          inject: [TASK_REPOSITORY],
        },
        {
          provide: GetTaskByIdUseCase,
          useFactory: (taskRepository: ITaskRepository) => {
            return new GetTaskByIdUseCase(taskRepository);
          },
          inject: [TASK_REPOSITORY],
        },
        {
          provide: CreateTaskUseCase,
          useFactory: (taskRepository: ITaskRepository) => {
            return new CreateTaskUseCase(taskRepository);
          },
          inject: [TASK_REPOSITORY],
        },
        {
          provide: UpdateTaskUseCase,
          useFactory: (taskRepository: ITaskRepository) => {
            return new UpdateTaskUseCase(taskRepository);
          },
          inject: [TASK_REPOSITORY],
        },
        {
          provide: DeleteTaskUseCase,
          useFactory: (taskRepository: ITaskRepository) => {
            return new DeleteTaskUseCase(taskRepository);
          },
          inject: [TASK_REPOSITORY],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /tasks', () => {
    it('should create a new task with all fields', async () => {
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

      expect(response.body).toMatchObject({
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
      const createTaskDto = {
        title: 'Test Task',
      };

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

      expect(response.body).toMatchObject({
        id: 1,
        title: 'Test Task',
        priority: 'medium',
        completed: false,
      });
    });

    it('should handle creating task without title (use case validation)', async () => {
      const createTaskDto = {
        description: 'Test Description',
      };

      const expectedTask = TaskFactory.create({
        id: 1,
        title: '',
        description: 'Test Description',
        priority: 'medium',
        completed: false,
      });

      mockTaskRepository.create.mockResolvedValue(expectedTask);

      // Note: Without ValidationPipe, the request will succeed
      // but the use case should handle validation
      await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto);

      // Verify repository was called
      expect(mockTaskRepository.create).toHaveBeenCalled();
    });
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = TaskFactory.createMany(2);

      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: mockTasks[0].id,
        title: mockTasks[0].title,
        priority: mockTasks[0].priority,
        completed: mockTasks[0].completed,
      });
      expect(response.body[1]).toMatchObject({
        id: mockTasks[1].id,
        title: mockTasks[1].title,
        priority: mockTasks[1].priority,
        completed: mockTasks[1].completed,
      });
      expect(mockTaskRepository.findAll).toHaveBeenCalledOnce();
    });

    it('should return empty array when no tasks exist', async () => {
      mockTaskRepository.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
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

      expect(response.body).toMatchObject({
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
        statusCode: 404,
        message: 'Task with ID 999 not found',
      });
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should return 400 when id is not a valid number (ParseIntPipe)', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Validation failed'),
      });
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update a task', async () => {
      const updateTaskDto = {
        title: 'Updated Task',
        completed: true,
      };

      const updatedTask = TaskFactory.create({
        id: 1,
        title: 'Updated Task',
        description: 'Original Description',
        priority: 'high',
        completed: true,
      });

      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const response = await request(app.getHttpServer())
        .patch('/tasks/1')
        .send(updateTaskDto)
        .expect(200);

      expect(response.body).toMatchObject({
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

    it('should update only provided fields', async () => {
      const updateTaskDto = {
        completed: true,
      };

      const updatedTask = TaskFactory.create({
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        priority: 'high',
        completed: true,
      });

      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const response = await request(app.getHttpServer())
        .patch('/tasks/1')
        .send(updateTaskDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        title: 'Original Task',
        completed: true,
      });
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          completed: true,
        }),
      );
    });

    it('should return 400 when id is not a valid number (ParseIntPipe)', async () => {
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
      mockTaskRepository.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/tasks/1').expect(200);

      expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return 400 when id is not a valid number (ParseIntPipe)', async () => {
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
