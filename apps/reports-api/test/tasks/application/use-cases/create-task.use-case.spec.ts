import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { Task } from '@tasks/domain/entities/task.entity';

describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase;
  let mockTaskRepository: ITaskRepository;

  beforeEach(() => {
    mockTaskRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    createTaskUseCase = new CreateTaskUseCase(mockTaskRepository);
  });

  it('should create a task with all fields', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high' as const,
    };

    const expectedTask = new Task(
      1,
      'Test Task',
      'Test Description',
      'high',
      false,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'create').mockResolvedValue(expectedTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        completed: false,
      }),
    );
    expect(result).toBe(expectedTask);
  });

  it('should create a task with default priority when not provided', async () => {
    const taskData = {
      title: 'Test Task',
    };

    const expectedTask = new Task(
      1,
      'Test Task',
      null,
      'medium',
      false,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'create').mockResolvedValue(expectedTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Task',
        description: null,
        priority: 'medium',
        completed: false,
      }),
    );
    expect(result).toBe(expectedTask);
  });

  it('should create a task with low priority', async () => {
    const taskData = {
      title: 'Low Priority Task',
      priority: 'low' as const,
    };

    const expectedTask = new Task(
      1,
      'Low Priority Task',
      null,
      'low',
      false,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'create').mockResolvedValue(expectedTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'low',
      }),
    );
    expect(result.priority).toBe('low');
  });

  it('should handle description as null when not provided', async () => {
    const taskData = {
      title: 'Test Task',
      description: undefined,
    };

    const expectedTask = new Task(
      1,
      'Test Task',
      null,
      'medium',
      false,
      new Date(),
      new Date(),
    );

    vi.spyOn(mockTaskRepository, 'create').mockResolvedValue(expectedTask);

    await createTaskUseCase.execute(taskData);

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      }),
    );
  });
});
