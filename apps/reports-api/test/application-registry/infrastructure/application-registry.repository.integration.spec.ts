import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { ApplicationRegistryRepository } from '@application-registry/infrastructure/repositories/application-registry.repository';

describe('ApplicationRegistryRepository (Integration)', () => {
  let repository: ApplicationRegistryRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new ApplicationRegistryRepository(db);
  });

  describe('create()', () => {
    it('should persist an application and return domain entity with generated id', async () => {
      const app = await repository.create({
        code: 'APP001',
        name: 'Test Application',
        description: 'A test app',
      });

      expect(app.id).toBeDefined();
      expect(app.code).toBe('APP001');
      expect(app.name).toBe('Test Application');
      expect(app.description).toBe('A test app');
      expect(app.isActive).toBe(true);
      expect(app.createdAt).toBeInstanceOf(Date);
      expect(app.updatedAt).toBeInstanceOf(Date);
    });

    it('should default isActive to true when not provided', async () => {
      const app = await repository.create({ code: 'APP002', name: 'App Two' });

      expect(app.isActive).toBe(true);
    });

    it('should allow creating with isActive false', async () => {
      const app = await repository.create({ code: 'APP003', name: 'Inactive App', isActive: false });

      expect(app.isActive).toBe(false);
    });
  });

  describe('findAll()', () => {
    it('should return only active applications', async () => {
      const active = await repository.create({ code: 'FA_ACTIVE', name: 'Active App' });
      const inactive = await repository.create({ code: 'FA_INACTIVE', name: 'Inactive App', isActive: false });

      const results = await repository.findAll();
      const ids = results.map((r) => r.id);

      expect(ids).toContain(active.id);
      expect(ids).not.toContain(inactive.id);
    });

    it('should return results ordered by code', async () => {
      const results = await repository.findAll();
      const codes = results.map((r) => r.code);
      const sorted = [...codes].sort();

      expect(codes).toEqual(sorted);
    });
  });

  describe('findById()', () => {
    it('should return the application matching the given id', async () => {
      const created = await repository.create({ code: 'FIND_BY_ID', name: 'Find Me' });

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.code).toBe('FIND_BY_ID');
    });

    it('should return null when no application matches the id', async () => {
      const result = await repository.findById(999999);

      expect(result).toBeNull();
    });

    it('should find inactive applications by id', async () => {
      const inactive = await repository.create({ code: 'INACTIVE_FIND', name: 'Inactive', isActive: false });

      const found = await repository.findById(inactive.id);

      expect(found).not.toBeNull();
      expect(found!.isActive).toBe(false);
    });
  });

  describe('findByPattern()', () => {
    it('should return application when application name matches a pattern', async () => {
      const app = await repository.create({ code: 'PAT_APP', name: 'Pattern App' });
      await repository.createPattern({
        applicationId: app.id,
        pattern: 'PAT_MATCH',
        priority: 1,
      });

      const found = await repository.findByPattern('Service-PAT_MATCH-v1');

      expect(found).not.toBeNull();
      expect(found!.id).toBe(app.id);
    });

    it('should return null when no pattern matches', async () => {
      const result = await repository.findByPattern('no-match-xyz-9999');

      expect(result).toBeNull();
    });

    it('should respect priority — lower number wins when multiple patterns match', async () => {
      const appA = await repository.create({ code: 'PRIO_A', name: 'Priority App A' });
      const appB = await repository.create({ code: 'PRIO_B', name: 'Priority App B' });
      await repository.createPattern({ applicationId: appA.id, pattern: 'SHARED_KEYWORD', priority: 10 });
      await repository.createPattern({ applicationId: appB.id, pattern: 'SHARED_KEYWORD', priority: 1 });

      const found = await repository.findByPattern('service-SHARED_KEYWORD-prod');

      expect(found!.id).toBe(appB.id);
    });
  });

  describe('findAllWithPatterns()', () => {
    it('should return active applications with their patterns', async () => {
      const app = await repository.create({ code: 'WITH_PAT', name: 'App With Patterns' });
      await repository.createPattern({ applicationId: app.id, pattern: 'pat-one', priority: 1 });
      await repository.createPattern({ applicationId: app.id, pattern: 'pat-two', priority: 2 });

      const results = await repository.findAllWithPatterns();
      const found = results.find((a) => a.id === app.id);

      expect(found).toBeDefined();
      expect(found!.patterns.length).toBeGreaterThanOrEqual(2);
    });

    it('should not include inactive applications', async () => {
      const inactive = await repository.create({ code: 'NO_PAT_INACTIVE', name: 'Inactive No Patterns', isActive: false });

      const results = await repository.findAllWithPatterns();
      const ids = results.map((a) => a.id);

      expect(ids).not.toContain(inactive.id);
    });
  });

  describe('update()', () => {
    it('should update fields and return updated entity', async () => {
      const created = await repository.create({ code: 'UPD_CODE', name: 'Before Update' });

      const updated = await repository.update(created.id, { name: 'After Update' });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('After Update');
      expect(updated.code).toBe('UPD_CODE');
    });
  });

  describe('delete()', () => {
    it('should soft delete — sets isActive to false so findAll excludes it', async () => {
      const created = await repository.create({ code: 'SOFT_DEL', name: 'To Soft Delete' });

      await repository.delete(created.id);

      const all = await repository.findAll();
      expect(all.map((a) => a.id)).not.toContain(created.id);
    });

    it('should still be findable by id after soft delete', async () => {
      const created = await repository.create({ code: 'SOFT_DEL2', name: 'Still Findable' });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.isActive).toBe(false);
    });
  });

  describe('createPattern() / deletePattern()', () => {
    it('should persist a pattern linked to an application', async () => {
      const app = await repository.create({ code: 'PAT_CREATE', name: 'App For Pattern' });

      const pattern = await repository.createPattern({
        applicationId: app.id,
        pattern: 'test-pattern',
        priority: 5,
        matchType: 'contains',
      });

      expect(pattern.id).toBeDefined();
      expect(pattern.applicationId).toBe(app.id);
      expect(pattern.pattern).toBe('test-pattern');
      expect(pattern.priority).toBe(5);
      expect(pattern.isActive).toBe(true);
    });

    it('should default priority to 100 and matchType to contains', async () => {
      const app = await repository.create({ code: 'PAT_DEFAULTS', name: 'App For Pattern Defaults' });

      const pattern = await repository.createPattern({
        applicationId: app.id,
        pattern: 'default-pattern',
      });

      expect(pattern.priority).toBe(100);
      expect(pattern.matchType).toBe('contains');
    });

    it('should hard delete a pattern and return true', async () => {
      const app = await repository.create({ code: 'PAT_DEL', name: 'App For Pattern Delete' });
      const pattern = await repository.createPattern({ applicationId: app.id, pattern: 'to-delete' });

      const deleted = await repository.deletePattern(pattern.id);

      expect(deleted).toBe(true);
    });

    it('should return false when pattern id does not exist', async () => {
      const deleted = await repository.deletePattern(999999);

      expect(deleted).toBe(false);
    });
  });
});
