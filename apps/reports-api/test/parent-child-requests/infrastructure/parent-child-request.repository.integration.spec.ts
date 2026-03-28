import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { ParentChildRequestRepository } from '@parent-child-requests/infrastructure/repositories/parent-child-request.repository';

describe('ParentChildRequestRepository (Integration)', () => {
  let repository: ParentChildRequestRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new ParentChildRequestRepository(db);
  });

  beforeEach(async () => {
    await repository.deleteAll();
  });

  describe('createOne()', () => {
    it('should persist a request and return domain entity with generated id', async () => {
      const record = await repository.createOne({
        requestId: 'REQ-001',
        linkedRequestId: 'REQ-PARENT-001',
      });

      expect(record.id).toBeDefined();
      expect(record.requestId).toBe('REQ-001');
      expect(record.linkedRequestId).toBe('REQ-PARENT-001');
    });

    it('should store optional link fields when provided', async () => {
      const record = await repository.createOne({
        requestId: 'REQ-002',
        linkedRequestId: 'REQ-PARENT-002',
        requestIdLink: 'https://example.com/req/002',
        linkedRequestIdLink: 'https://example.com/req/parent-002',
      });

      expect(record.requestIdLink).toBe('https://example.com/req/002');
      expect(record.linkedRequestIdLink).toBe('https://example.com/req/parent-002');
    });

    it('should set link fields to null when not provided', async () => {
      const record = await repository.createOne({
        requestId: 'REQ-003',
        linkedRequestId: 'REQ-PARENT-003',
      });

      expect(record.requestIdLink).toBeNull();
      expect(record.linkedRequestIdLink).toBeNull();
    });
  });

  describe('bulkCreate()', () => {
    it('should insert multiple records in one call', async () => {
      await repository.bulkCreate([
        { requestId: 'BULK-001', linkedRequestId: 'PARENT-001' },
        { requestId: 'BULK-002', linkedRequestId: 'PARENT-001' },
        { requestId: 'BULK-003', linkedRequestId: 'PARENT-002' },
      ]);

      const total = await repository.countAll();
      expect(total).toBe(3);
    });
  });

  describe('findAll()', () => {
    it('should return records with default pagination (limit 50, offset 0)', async () => {
      await repository.bulkCreate([
        { requestId: 'FA-001', linkedRequestId: 'FA-PARENT' },
        { requestId: 'FA-002', linkedRequestId: 'FA-PARENT' },
      ]);

      const results = await repository.findAll();
      expect(results.length).toBe(2);
    });

    it('should respect limit parameter', async () => {
      await repository.bulkCreate([
        { requestId: 'LIM-001', linkedRequestId: 'LIM-PARENT' },
        { requestId: 'LIM-002', linkedRequestId: 'LIM-PARENT' },
        { requestId: 'LIM-003', linkedRequestId: 'LIM-PARENT' },
      ]);

      const results = await repository.findAll(2);
      expect(results.length).toBe(2);
    });

    it('should respect offset parameter for pagination', async () => {
      await repository.bulkCreate([
        { requestId: 'OFF-001', linkedRequestId: 'OFF-PARENT' },
        { requestId: 'OFF-002', linkedRequestId: 'OFF-PARENT' },
        { requestId: 'OFF-003', linkedRequestId: 'OFF-PARENT' },
      ]);

      const page1 = await repository.findAll(2, 0);
      const page2 = await repository.findAll(2, 2);

      expect(page1.length).toBe(2);
      expect(page2.length).toBe(1);
      expect(page1[0]!.id).not.toBe(page2[0]!.id);
    });
  });

  describe('findByParentId()', () => {
    it('should return all children of a given parent id', async () => {
      await repository.bulkCreate([
        { requestId: 'CHILD-001', linkedRequestId: 'PARENT-X' },
        { requestId: 'CHILD-002', linkedRequestId: 'PARENT-X' },
        { requestId: 'CHILD-003', linkedRequestId: 'PARENT-Y' },
      ]);

      const children = await repository.findByParentId('PARENT-X');

      expect(children.length).toBe(2);
      expect(children.every((c) => c.linkedRequestId === 'PARENT-X')).toBe(true);
    });

    it('should return empty array when parent id has no children', async () => {
      const children = await repository.findByParentId('NONEXISTENT-PARENT');

      expect(children).toEqual([]);
    });
  });

  describe('countAll()', () => {
    it('should return total record count', async () => {
      await repository.bulkCreate([
        { requestId: 'CNT-001', linkedRequestId: 'CNT-PARENT' },
        { requestId: 'CNT-002', linkedRequestId: 'CNT-PARENT' },
      ]);

      const total = await repository.countAll();
      expect(total).toBe(2);
    });

    it('should return 0 when table is empty', async () => {
      const total = await repository.countAll();
      expect(total).toBe(0);
    });
  });

  describe('getStats()', () => {
    it('should return empty stats when table is empty', async () => {
      const stats = await repository.getStats();

      expect(stats.totalRecords).toBe(0);
      expect(stats.uniqueParents).toBe(0);
      expect(stats.topParents).toEqual([]);
    });

    it('should return correct stats when records exist', async () => {
      await repository.bulkCreate([
        { requestId: 'STAT-001', linkedRequestId: 'STAT-PARENT-A' },
        { requestId: 'STAT-002', linkedRequestId: 'STAT-PARENT-A' },
        { requestId: 'STAT-003', linkedRequestId: 'STAT-PARENT-B' },
      ]);

      const stats = await repository.getStats();

      expect(stats.totalRecords).toBe(3);
      expect(stats.uniqueParents).toBe(2);
      expect(stats.topParents.length).toBeGreaterThanOrEqual(1);
      expect(stats.topParents[0]!.parentId).toBe('STAT-PARENT-A');
      expect(stats.topParents[0]!.childCount).toBe(2);
    });
  });

  describe('deleteAll()', () => {
    it('should remove all records', async () => {
      await repository.bulkCreate([
        { requestId: 'DEL-001', linkedRequestId: 'DEL-PARENT' },
        { requestId: 'DEL-002', linkedRequestId: 'DEL-PARENT' },
      ]);

      await repository.deleteAll();

      const total = await repository.countAll();
      expect(total).toBe(0);
    });
  });
});
