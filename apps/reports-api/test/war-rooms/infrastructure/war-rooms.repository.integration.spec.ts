import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { WarRoomsRepository } from '@war-rooms/infrastructure/repositories/war-rooms.repository';
import { ApplicationRegistryRepository } from '@application-registry/infrastructure/repositories/application-registry.repository';

const makeWarRoom = (overrides: Partial<Parameters<WarRoomsRepository['bulkCreate']>[0][0]> = {}) => ({
  requestId: Math.floor(Math.random() * 1_000_000),
  requestIdLink: 'https://example.com/req/1',
  application: 'Test App',
  date: new Date('2024-03-15'),
  summary: 'Test incident summary',
  initialPriority: 'HIGH',
  startTime: new Date('2024-03-15T10:00:00'),
  durationMinutes: 60,
  endTime: new Date('2024-03-15T11:00:00'),
  participants: 5,
  status: 'Closed',
  priorityChanged: 'No',
  resolutionTeamChanged: 'No',
  notes: 'Test notes',
  rcaStatus: 'Completed',
  urlRca: 'https://example.com/rca/1',
  ...overrides,
});

describe('WarRoomsRepository (Integration)', () => {
  let repository: WarRoomsRepository;
  let appRepository: ApplicationRegistryRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new WarRoomsRepository(db);
    appRepository = new ApplicationRegistryRepository(db);
  });

  beforeEach(async () => {
    await repository.deleteAll();
  });

  describe('bulkCreate()', () => {
    it('should insert multiple war room records', async () => {
      await repository.bulkCreate([
        makeWarRoom({ requestId: 1001 }),
        makeWarRoom({ requestId: 1002 }),
        makeWarRoom({ requestId: 1003 }),
      ]);

      const total = await repository.countAll();
      expect(total).toBe(3);
    });

    it('should do nothing when given an empty array', async () => {
      await repository.bulkCreate([]);

      const total = await repository.countAll();
      expect(total).toBe(0);
    });
  });

  describe('findAll()', () => {
    it('should return all records ordered by date and startTime DESC', async () => {
      await repository.bulkCreate([
        makeWarRoom({ requestId: 2001, date: new Date('2024-01-01'), startTime: new Date('2024-01-01T09:00:00') }),
        makeWarRoom({ requestId: 2002, date: new Date('2024-06-01'), startTime: new Date('2024-06-01T10:00:00') }),
        makeWarRoom({ requestId: 2003, date: new Date('2024-03-01'), startTime: new Date('2024-03-01T08:00:00') }),
      ]);

      const results = await repository.findAll();

      expect(results.length).toBe(3);
      // Most recent first
      expect(results[0]!.requestId).toBe(2002);
      expect(results[2]!.requestId).toBe(2001);
    });
  });

  describe('countAll()', () => {
    it('should return 0 when table is empty', async () => {
      expect(await repository.countAll()).toBe(0);
    });

    it('should return correct count after insert', async () => {
      await repository.bulkCreate([
        makeWarRoom({ requestId: 3001 }),
        makeWarRoom({ requestId: 3002 }),
      ]);

      expect(await repository.countAll()).toBe(2);
    });
  });

  describe('deleteAll()', () => {
    it('should remove all records and return affected row count', async () => {
      await repository.bulkCreate([
        makeWarRoom({ requestId: 4001 }),
        makeWarRoom({ requestId: 4002 }),
      ]);

      const deleted = await repository.deleteAll();

      expect(deleted).toBeGreaterThanOrEqual(2);
      expect(await repository.countAll()).toBe(0);
    });
  });

  describe('findAllWithApplication()', () => {
    it('should return war rooms with null app when no pattern matches', async () => {
      await repository.bulkCreate([
        makeWarRoom({ requestId: 5001, application: 'UnmatchedApp XYZ' }),
      ]);

      const results = await repository.findAllWithApplication();

      expect(results.length).toBe(1);
      expect(results[0]!.app).toBeNull();
    });

    it('should return war rooms with resolved app when pattern matches', async () => {
      const app = await appRepository.create({ code: 'WR_APP', name: 'War Room App' });
      await appRepository.createPattern({ applicationId: app.id, pattern: 'WR_KEYWORD', priority: 1 });

      await repository.bulkCreate([
        makeWarRoom({ requestId: 6001, application: 'service-WR_KEYWORD-prod' }),
      ]);

      const results = await repository.findAllWithApplication();
      const found = results.find((r) => r.requestId === 6001);

      expect(found).toBeDefined();
      expect(found!.app).not.toBeNull();
      expect(found!.app!.code).toBe('WR_APP');
    });
  });

  describe('countFiltered()', () => {
    it('should return total count when no filters applied', async () => {
      await repository.bulkCreate([
        makeWarRoom({ requestId: 7001 }),
        makeWarRoom({ requestId: 7002 }),
      ]);

      const count = await repository.countFiltered();
      expect(count).toBe(2);
    });

    it('should filter by month', async () => {
      await repository.bulkCreate([
        makeWarRoom({ requestId: 8001, date: new Date('2024-03-10') }),
        makeWarRoom({ requestId: 8002, date: new Date('2024-04-10') }),
      ]);

      const count = await repository.countFiltered(undefined, '2024-03');
      expect(count).toBe(1);
    });
  });
});
