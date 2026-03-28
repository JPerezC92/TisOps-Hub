import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { CorrectiveStatusRegistryRepository } from '@corrective-status-registry/infrastructure/repositories/corrective-status-registry.repository';

describe('CorrectiveStatusRegistryRepository (Integration)', () => {
  let repository: CorrectiveStatusRegistryRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new CorrectiveStatusRegistryRepository(db);
  });

  describe('create()', () => {
    it('should persist a status and return domain entity with generated id', async () => {
      const status = await repository.create({
        rawStatus: 'En Pruebas',
        displayStatus: 'In Testing',
      });

      expect(status.id).toBeDefined();
      expect(status.rawStatus).toBe('En Pruebas');
      expect(status.displayStatus).toBe('In Testing');
      expect(status.isActive).toBe(true);
    });

    it('should default isActive to true when not provided', async () => {
      const status = await repository.create({
        rawStatus: 'Pendiente',
        displayStatus: 'Pending',
      });

      expect(status.isActive).toBe(true);
    });
  });

  describe('findAll()', () => {
    it('should return only active statuses', async () => {
      const active = await repository.create({ rawStatus: 'Active Raw', displayStatus: 'Active' });
      const inactive = await repository.create({ rawStatus: 'Inactive Raw', displayStatus: 'Inactive', isActive: false });

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
      const created = await repository.create({ rawStatus: 'Find By Id', displayStatus: 'Found' });

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.rawStatus).toBe('Find By Id');
    });

    it('should return null when no status matches the id', async () => {
      const result = await repository.findById(999999);

      expect(result).toBeNull();
    });
  });

  describe('findByRawStatus()', () => {
    it('should return the status matching the raw status string', async () => {
      await repository.create({ rawStatus: 'Unique Raw Status', displayStatus: 'Unique Display' });

      const found = await repository.findByRawStatus('Unique Raw Status');

      expect(found).not.toBeNull();
      expect(found!.displayStatus).toBe('Unique Display');
    });

    it('should return null when raw status does not exist', async () => {
      const result = await repository.findByRawStatus('nonexistent-status');

      expect(result).toBeNull();
    });
  });

  describe('findDistinctDisplayStatuses()', () => {
    it('should return distinct display statuses for active records only', async () => {
      await repository.create({ rawStatus: 'Raw A1', displayStatus: 'Shared Display' });
      await repository.create({ rawStatus: 'Raw A2', displayStatus: 'Shared Display' });
      await repository.create({ rawStatus: 'Raw Inactive', displayStatus: 'Shared Display', isActive: false });

      const statuses = await repository.findDistinctDisplayStatuses();

      const count = statuses.filter((s) => s === 'Shared Display').length;
      expect(count).toBe(1);
    });
  });

  describe('update()', () => {
    it('should update fields and return updated entity', async () => {
      const created = await repository.create({ rawStatus: 'Before Update', displayStatus: 'Old Display' });

      const updated = await repository.update(created.id, { displayStatus: 'New Display' });

      expect(updated.id).toBe(created.id);
      expect(updated.displayStatus).toBe('New Display');
      expect(updated.rawStatus).toBe('Before Update');
    });
  });

  describe('delete()', () => {
    it('should soft delete — sets isActive to false so findAll excludes it', async () => {
      const created = await repository.create({ rawStatus: 'To Soft Delete', displayStatus: 'Delete Me' });

      await repository.delete(created.id);

      const all = await repository.findAll();
      expect(all.map((r) => r.id)).not.toContain(created.id);
    });

    it('should still be findable by id after soft delete', async () => {
      const created = await repository.create({ rawStatus: 'Still Findable', displayStatus: 'Soft Deleted' });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.isActive).toBe(false);
    });
  });
});
