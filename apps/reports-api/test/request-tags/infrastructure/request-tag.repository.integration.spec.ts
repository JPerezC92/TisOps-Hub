import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { RequestTagRepository } from '@request-tags/infrastructure/repositories/request-tag.repository';
import { ParentChildRequestRepository } from '@parent-child-requests/infrastructure/repositories/parent-child-request.repository';

let counter = 0;
const makeTag = (overrides: Partial<Parameters<RequestTagRepository['create']>[0]> = {}) => {
  counter++;
  return {
    requestId: `RT-${String(counter).padStart(6, '0')}`,
    createdTime: '15/01/2024 10:30',
    informacionAdicional: 'Team Alpha',
    modulo: 'Core',
    problemId: `PROB-${counter}`,
    linkedRequestId: 'LR-PARENT-001',
    jira: 'JIRA-123',
    categorizacion: 'Bug',
    technician: 'Jane Doe',
    ...overrides,
  };
};

describe('RequestTagRepository (Integration)', () => {
  let repository: RequestTagRepository;
  let parentChildRepo: ParentChildRequestRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new RequestTagRepository(db);
    parentChildRepo = new ParentChildRequestRepository(db);
  });

  beforeEach(async () => {
    await repository.deleteAll();
    await parentChildRepo.deleteAll();
    counter = 0;
  });

  describe('create()', () => {
    it('should persist a tag and return domain entity', async () => {
      const tag = await repository.create(makeTag({ requestId: 'RT-001' }));

      expect(tag.requestId).toBe('RT-001');
      expect(tag.informacionAdicional).toBe('Team Alpha');
      expect(tag.technician).toBe('Jane Doe');
    });

    it('should store optional link fields when provided', async () => {
      const tag = await repository.create(makeTag({
        requestId: 'RT-002',
        requestIdLink: 'https://example.com/rt/002',
        linkedRequestIdLink: 'https://example.com/lr/001',
      }));

      expect(tag.requestIdLink).toBe('https://example.com/rt/002');
      expect(tag.linkedRequestIdLink).toBe('https://example.com/lr/001');
    });

    it('should set link fields to null/undefined when not provided', async () => {
      const tag = await repository.create(makeTag({ requestId: 'RT-003' }));

      expect(tag.requestIdLink ?? null).toBeNull();
      expect(tag.linkedRequestIdLink ?? null).toBeNull();
    });
  });

  describe('createMany()', () => {
    it('should insert multiple records and return count', async () => {
      const count = await repository.createMany([
        makeTag({ requestId: 'CM-001' }),
        makeTag({ requestId: 'CM-002' }),
        makeTag({ requestId: 'CM-003' }),
      ]);

      expect(count).toBe(3);
      expect(await repository.count()).toBe(3);
    });

    it('should return 0 when given empty array', async () => {
      const count = await repository.createMany([]);
      expect(count).toBe(0);
    });

    it('should skip duplicates (same requestId) without throwing', async () => {
      await repository.createMany([
        makeTag({ requestId: 'DUP-001' }),
      ]);

      // Insert again — should skip the duplicate
      await expect(
        repository.createMany([makeTag({ requestId: 'DUP-001' })]),
      ).resolves.not.toThrow();

      expect(await repository.count()).toBe(1);
    });
  });

  describe('findAll()', () => {
    it('should return all persisted tags', async () => {
      await repository.createMany([
        makeTag({ requestId: 'FA-001' }),
        makeTag({ requestId: 'FA-002' }),
      ]);

      const results = await repository.findAll();
      expect(results.length).toBe(2);
    });
  });

  describe('findById() / findByRequestId()', () => {
    it('should return the tag matching the given requestId', async () => {
      await repository.create(makeTag({ requestId: 'FIND-001', modulo: 'Billing' }));

      const found = await repository.findById('FIND-001');

      expect(found).not.toBeNull();
      expect(found!.requestId).toBe('FIND-001');
      expect(found!.modulo).toBe('Billing');
    });

    it('should return null when requestId does not exist', async () => {
      expect(await repository.findById('NONEXISTENT')).toBeNull();
    });

    it('findByRequestId should behave identically to findById', async () => {
      await repository.create(makeTag({ requestId: 'FIND-002' }));

      const byId = await repository.findById('FIND-002');
      const byRequestId = await repository.findByRequestId('FIND-002');

      expect(byId?.requestId).toBe(byRequestId?.requestId);
    });
  });

  describe('findByLinkedRequestId()', () => {
    it('should return all tags for a given linked request id', async () => {
      await repository.createMany([
        makeTag({ requestId: 'LR-C1', linkedRequestId: 'LR-PARENT-X' }),
        makeTag({ requestId: 'LR-C2', linkedRequestId: 'LR-PARENT-X' }),
        makeTag({ requestId: 'LR-C3', linkedRequestId: 'LR-PARENT-Y' }),
      ]);

      const children = await repository.findByLinkedRequestId('LR-PARENT-X');

      expect(children.length).toBe(2);
      expect(children.every((t) => t.linkedRequestId === 'LR-PARENT-X')).toBe(true);
    });

    it('should return empty array when no tags match', async () => {
      expect(await repository.findByLinkedRequestId('NONEXISTENT')).toEqual([]);
    });
  });

  describe('findRequestIdsByAdditionalInfo()', () => {
    it('should return requestIds matching both info and linkedRequestId', async () => {
      await repository.createMany([
        makeTag({ requestId: 'AI-001', informacionAdicional: 'Team Beta', linkedRequestId: 'LR-P01' }),
        makeTag({ requestId: 'AI-002', informacionAdicional: 'Team Beta', linkedRequestId: 'LR-P01' }),
        makeTag({ requestId: 'AI-003', informacionAdicional: 'Team Gamma', linkedRequestId: 'LR-P01' }),
      ]);

      const results = await repository.findRequestIdsByAdditionalInfo('Team Beta', 'LR-P01');

      expect(results.length).toBe(2);
      expect(results.map((r) => r.requestId)).toContain('AI-001');
      expect(results.map((r) => r.requestId)).toContain('AI-002');
    });

    it('should return empty array when no match', async () => {
      const results = await repository.findRequestIdsByAdditionalInfo('Unknown Team', 'LR-NONE');
      expect(results).toEqual([]);
    });
  });

  describe('findMissingIdsByLinkedRequestId()', () => {
    it('should return requestIds in parent_child_requests not in request_tags', async () => {
      // Add 3 parent-child records
      await parentChildRepo.bulkCreate([
        { requestId: 'PCR-001', linkedRequestId: 'PARENT-Z' },
        { requestId: 'PCR-002', linkedRequestId: 'PARENT-Z' },
        { requestId: 'PCR-003', linkedRequestId: 'PARENT-Z' },
      ]);

      // Only tag PCR-001 and PCR-002
      await repository.createMany([
        makeTag({ requestId: 'PCR-001', linkedRequestId: 'PARENT-Z' }),
        makeTag({ requestId: 'PCR-002', linkedRequestId: 'PARENT-Z' }),
      ]);

      const missing = await repository.findMissingIdsByLinkedRequestId('PARENT-Z');

      expect(missing.length).toBe(1);
      expect(missing[0]!.requestId).toBe('PCR-003');
    });

    it('should return empty array when all parent-child requestIds are tagged', async () => {
      await parentChildRepo.bulkCreate([
        { requestId: 'FULL-001', linkedRequestId: 'PARENT-Q' },
      ]);
      await repository.create(makeTag({ requestId: 'FULL-001', linkedRequestId: 'PARENT-Q' }));

      const missing = await repository.findMissingIdsByLinkedRequestId('PARENT-Q');
      expect(missing).toEqual([]);
    });
  });

  describe('count() / deleteAll()', () => {
    it('count should return 0 on empty table', async () => {
      expect(await repository.count()).toBe(0);
    });

    it('deleteAll should remove all records', async () => {
      await repository.createMany([
        makeTag({ requestId: 'DEL-001' }),
        makeTag({ requestId: 'DEL-002' }),
      ]);

      await repository.deleteAll();

      expect(await repository.count()).toBe(0);
    });
  });
});
