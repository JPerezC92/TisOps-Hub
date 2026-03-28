import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { TaskRepository } from '@tasks/infrastructure/repositories/task.repository';

describe('TaskRepository (Integration)', () => {
  let repository: TaskRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new TaskRepository(db);
  });

  describe('create()', () => {
    it('should persist a task and return domain entity with generated id', async () => {
      const task = await repository.create({ title: 'My Task', priority: 'high' });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('My Task');
      expect(task.priority).toBe('high');
      expect(task.completed).toBe(false);
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should apply default priority when not provided', async () => {
      const task = await repository.create({ title: 'Default Priority Task' });

      expect(task.priority).toBe('medium');
    });

    it('should store null description when not provided', async () => {
      const task = await repository.create({ title: 'No Description' });

      expect(task.description).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('should return all persisted tasks as domain entities', async () => {
      await repository.create({ title: 'Task A' });
      await repository.create({ title: 'Task B' });

      const tasks = await repository.findAll();

      expect(tasks.length).toBeGreaterThanOrEqual(2);
      expect(tasks[0].id).toBeDefined();
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('findById()', () => {
    it('should return the task matching the given id', async () => {
      const created = await repository.create({ title: 'Find Me' });

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.title).toBe('Find Me');
    });

    it('should return null when no task matches the id', async () => {
      const result = await repository.findById(999999);

      expect(result).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update the specified fields and return updated entity', async () => {
      const created = await repository.create({ title: 'Before Update', priority: 'low' });

      const updated = await repository.update(created.id, { title: 'After Update', completed: true });

      expect(updated.id).toBe(created.id);
      expect(updated.title).toBe('After Update');
      expect(updated.completed).toBe(true);
      expect(updated.priority).toBe('low');
    });

    it('should set updatedAt to a new value after update', async () => {
      const created = await repository.create({ title: 'Timestamp Task' });

      await new Promise((r) => setTimeout(r, 10));
      const updated = await repository.update(created.id, { title: 'Updated' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });
  });

  describe('delete()', () => {
    it('should remove the task so findById returns null afterwards', async () => {
      const created = await repository.create({ title: 'To Delete' });

      await repository.delete(created.id);

      const result = await repository.findById(created.id);
      expect(result).toBeNull();
    });
  });
});
