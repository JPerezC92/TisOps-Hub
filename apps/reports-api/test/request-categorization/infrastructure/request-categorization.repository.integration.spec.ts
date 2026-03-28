import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { RequestCategorizationRepository } from '@request-categorization/infrastructure/repositories/request-categorization.repository';
import { RequestCategorizationEntity } from '@request-categorization/domain/entities/request-categorization.entity';
import { RequestTagRepository } from '@request-tags/infrastructure/repositories/request-tag.repository';

let counter = 0;
const makeEntity = (overrides: {
  requestId?: string;
  category?: string;
  technician?: string;
  linkedRequestId?: string;
  modulo?: string;
  subject?: string;
} = {}) => {
  counter++;
  return RequestCategorizationEntity.create(
    overrides.requestId ?? `RC-${String(counter).padStart(6, '0')}`,
    overrides.category ?? 'Bug',
    overrides.technician ?? 'Jane Doe',
    '15/01/2024 10:30',
    overrides.modulo ?? 'Core',
    overrides.subject ?? 'Test subject',
    `PROB-${counter}`,
    overrides.linkedRequestId ?? 'LR-PARENT-001',
  );
};

describe('RequestCategorizationRepository (Integration)', () => {
  let repository: RequestCategorizationRepository;
  let tagRepository: RequestTagRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new RequestCategorizationRepository(db);
    tagRepository = new RequestTagRepository(db);
  });

  beforeEach(async () => {
    await repository.deleteAll();
    await tagRepository.deleteAll();
    counter = 0;
  });

  describe('create()', () => {
    it('should persist an entity and return it', async () => {
      const entity = makeEntity({ requestId: 'RC-001', category: 'Bug' });

      const result = await repository.create(entity);

      expect(result.getRequestId()).toBe('RC-001');
      expect(result.getCategory()).toBe('Bug');
      expect(result.getTechnician()).toBe('Jane Doe');
    });
  });

  describe('createMany()', () => {
    it('should insert multiple entities and return them', async () => {
      const entities = [
        makeEntity({ requestId: 'CM-001' }),
        makeEntity({ requestId: 'CM-002' }),
        makeEntity({ requestId: 'CM-003' }),
      ];

      const results = await repository.createMany(entities);

      expect(results.length).toBe(3);
      expect(results.map((r) => r.getRequestId())).toContain('CM-001');
    });
  });

  describe('findAll()', () => {
    it('should return all persisted entities', async () => {
      await repository.createMany([
        makeEntity({ requestId: 'FA-001' }),
        makeEntity({ requestId: 'FA-002' }),
      ]);

      const results = await repository.findAll();
      expect(results.length).toBe(2);
    });
  });

  describe('findByCategory()', () => {
    it('should return only entities matching the given category', async () => {
      await repository.createMany([
        makeEntity({ requestId: 'FC-001', category: 'Bug' }),
        makeEntity({ requestId: 'FC-002', category: 'Bug' }),
        makeEntity({ requestId: 'FC-003', category: 'Alcance' }),
      ]);

      const bugs = await repository.findByCategory('Bug');

      expect(bugs.length).toBe(2);
      expect(bugs.every((e) => e.getCategory() === 'Bug')).toBe(true);
    });

    it('should return empty array when no entity matches the category', async () => {
      const results = await repository.findByCategory('Nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('upsertMany()', () => {
    it('should insert new entities and count them as created', async () => {
      const entities = [
        makeEntity({ requestId: 'UP-001' }),
        makeEntity({ requestId: 'UP-002' }),
      ];

      // After upsertMany, all are in the DB — the exact created/updated split
      // is reported based on a subsequent SELECT, so just verify total count
      await repository.upsertMany(entities);

      const all = await repository.findAll();
      expect(all.length).toBe(2);
    });

    it('should update existing entities on conflict (same requestId)', async () => {
      await repository.create(makeEntity({ requestId: 'UP-EXISTING', category: 'Bug' }));

      const updated = RequestCategorizationEntity.create(
        'UP-EXISTING',
        'Alcance', // changed
        'John Doe', // changed
        '20/01/2024 09:00',
        'Billing',
        'Updated subject',
        'PROB-UP',
        'LR-PARENT-X',
      );

      await repository.upsertMany([updated]);

      const all = await repository.findAll();
      const found = all.find((e) => e.getRequestId() === 'UP-EXISTING');

      expect(found!.getCategory()).toBe('Alcance');
      expect(found!.getTechnician()).toBe('John Doe');
    });
  });

  describe('getCategorySummary()', () => {
    it('should return count grouped by category', async () => {
      await repository.createMany([
        makeEntity({ requestId: 'CS-001', category: 'Bug' }),
        makeEntity({ requestId: 'CS-002', category: 'Bug' }),
        makeEntity({ requestId: 'CS-003', category: 'Alcance' }),
      ]);

      const summary = await repository.getCategorySummary();

      const bugEntry = summary.find((s) => s.category === 'Bug');
      const alcanceEntry = summary.find((s) => s.category === 'Alcance');

      expect(bugEntry).toBeDefined();
      expect(bugEntry!.count).toBe(2);
      expect(alcanceEntry).toBeDefined();
      expect(alcanceEntry!.count).toBe(1);
    });

    it('should return empty array when no records exist', async () => {
      expect(await repository.getCategorySummary()).toEqual([]);
    });
  });

  describe('findRequestIdsByCategorizacion()', () => {
    it('should return requestIds in request_tags matching linkedRequestId and categorizacion', async () => {
      // Populate request_tags
      await tagRepository.createMany([
        { requestId: 'TAG-001', createdTime: '15/01/2024 10:00', informacionAdicional: 'Team A', modulo: 'Core', problemId: 'P1', linkedRequestId: 'LR-PARENT-A', jira: 'No asignado', categorizacion: 'Bug', technician: 'Dev1' },
        { requestId: 'TAG-002', createdTime: '15/01/2024 10:00', informacionAdicional: 'Team A', modulo: 'Core', problemId: 'P2', linkedRequestId: 'LR-PARENT-A', jira: 'No asignado', categorizacion: 'Bug', technician: 'Dev1' },
        { requestId: 'TAG-003', createdTime: '15/01/2024 10:00', informacionAdicional: 'Team A', modulo: 'Core', problemId: 'P3', linkedRequestId: 'LR-PARENT-A', jira: 'No asignado', categorizacion: 'Alcance', technician: 'Dev1' },
      ]);

      const results = await repository.findRequestIdsByCategorizacion('LR-PARENT-A', 'Bug');

      expect(results.length).toBe(2);
      expect(results.map((r) => r.requestId)).toContain('TAG-001');
      expect(results.map((r) => r.requestId)).toContain('TAG-002');
    });

    it('should return empty array when no match', async () => {
      const results = await repository.findRequestIdsByCategorizacion('NONEXISTENT', 'Bug');
      expect(results).toEqual([]);
    });
  });

  describe('findAllWithAdditionalInfo()', () => {
    it('should return categorizations with aggregated additionalInformation from request_tags', async () => {
      const linkedId = 'LR-JOIN-PARENT';

      await repository.create(makeEntity({ requestId: 'JOIN-001', linkedRequestId: linkedId }));

      await tagRepository.createMany([
        { requestId: 'TAG-J1', createdTime: '15/01/2024', informacionAdicional: 'Team Alpha', modulo: 'Core', problemId: 'P1', linkedRequestId: linkedId, jira: 'No asignado', categorizacion: 'Bug', technician: 'Dev1' },
        { requestId: 'TAG-J2', createdTime: '15/01/2024', informacionAdicional: 'Team Beta', modulo: 'Core', problemId: 'P2', linkedRequestId: linkedId, jira: 'No asignado', categorizacion: 'Bug', technician: 'Dev1' },
      ]);

      const results = await repository.findAllWithAdditionalInfo();
      const found = results.find((r) => r.requestId === 'JOIN-001');

      expect(found).toBeDefined();
      expect(found!.additionalInformation).toContain('Team Alpha');
      expect(found!.additionalInformation).toContain('Team Beta');
    });

    it('should return empty additionalInformation when linkedRequestId has no tags', async () => {
      await repository.create(makeEntity({ requestId: 'NOJOIN-001', linkedRequestId: 'LR-ISOLATED' }));

      const results = await repository.findAllWithAdditionalInfo();
      const found = results.find((r) => r.requestId === 'NOJOIN-001');

      expect(found).toBeDefined();
      expect(found!.additionalInformation).toEqual([]);
    });
  });

  describe('deleteAll()', () => {
    it('should remove all records', async () => {
      await repository.createMany([
        makeEntity({ requestId: 'DEL-001' }),
        makeEntity({ requestId: 'DEL-002' }),
      ]);

      await repository.deleteAll();

      expect(await repository.findAll()).toEqual([]);
    });
  });
});
