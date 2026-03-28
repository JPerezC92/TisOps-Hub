import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { MonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/infrastructure/repositories/monthly-report-status-registry.repository';

describe('MonthlyReportStatusRegistryRepository (Integration)', () => {
  let repository: MonthlyReportStatusRegistryRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new MonthlyReportStatusRegistryRepository(db);
  });

  describe('create()', () => {
    it('should persist a status and return domain entity with generated id', async () => {
      const status = await repository.create({
        rawStatus: 'Nivel 1',
        displayStatus: 'Level 1',
      });

      expect(status.id).toBeDefined();
      expect(status.rawStatus).toBe('Nivel 1');
      expect(status.displayStatus).toBe('Level 1');
      expect(status.isActive).toBe(true);
    });

    it('should default isActive to true when not provided', async () => {
      const status = await repository.create({
        rawStatus: 'Nivel 2',
        displayStatus: 'Level 2',
      });

      expect(status.isActive).toBe(true);
    });
  });

  describe('findAll()', () => {
    it('should return only active statuses', async () => {
      const active = await repository.create({ rawStatus: 'Active MR Raw', displayStatus: 'Active MR' });
      const inactive = await repository.create({ rawStatus: 'Inactive MR Raw', displayStatus: 'Inactive MR', isActive: false });

      const results = await repository.findAll();
      const ids = results.map((r) => r.id);

      expect(ids).toContain(active.id);
      expect(ids).not.toContain(inactive.id);
    });

    it('should return results ordered by rawStatus', async () => {
      const results = await repository.findAll();
      const rawStatuses = results.map((r) => r.rawStatus);
      const sorted = [...rawStatuses].sort();

      expect(rawStatuses).toEqual(sorted);
    });
  });

  describe('findById()', () => {
    it('should return the status matching the given id', async () => {
      const created = await repository.create({ rawStatus: 'MR Find By Id', displayStatus: 'MR Found' });

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.rawStatus).toBe('MR Find By Id');
    });

    it('should return null when no status matches the id', async () => {
      const result = await repository.findById(999999);

      expect(result).toBeNull();
    });
  });

  describe('findByRawStatus()', () => {
    it('should return the status matching the raw status string', async () => {
      await repository.create({ rawStatus: 'MR Unique Raw', displayStatus: 'MR Unique Display' });

      const found = await repository.findByRawStatus('MR Unique Raw');

      expect(found).not.toBeNull();
      expect(found!.displayStatus).toBe('MR Unique Display');
    });

    it('should return null when raw status does not exist', async () => {
      const result = await repository.findByRawStatus('nonexistent-mr-status');

      expect(result).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update fields and return updated entity', async () => {
      const created = await repository.create({ rawStatus: 'MR Before Update', displayStatus: 'MR Old Display' });

      const updated = await repository.update(created.id, { displayStatus: 'MR New Display' });

      expect(updated.id).toBe(created.id);
      expect(updated.displayStatus).toBe('MR New Display');
      expect(updated.rawStatus).toBe('MR Before Update');
    });
  });

  describe('delete()', () => {
    it('should soft delete — sets isActive to false so findAll excludes it', async () => {
      const created = await repository.create({ rawStatus: 'MR To Soft Delete', displayStatus: 'MR Delete Me' });

      await repository.delete(created.id);

      const all = await repository.findAll();
      expect(all.map((r) => r.id)).not.toContain(created.id);
    });

    it('should still be findable by id after soft delete', async () => {
      const created = await repository.create({ rawStatus: 'MR Still Findable', displayStatus: 'MR Soft Deleted' });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.isActive).toBe(false);
    });
  });
});
