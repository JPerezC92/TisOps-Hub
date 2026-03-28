import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { WeeklyCorrectiveRepository } from '@weekly-corrective/infrastructure/repositories/weekly-corrective.repository';

const makeRecord = (overrides: Partial<Parameters<WeeklyCorrectiveRepository['bulkCreate']>[0][0]> = {}) => ({
  requestId: Math.floor(Math.random() * 1_000_000),
  technician: 'John Doe',
  aplicativos: 'Test Application',
  categorizacion: 'Bug',
  createdTime: '15/01/2024 10:30',
  requestStatus: 'En Pruebas',
  modulo: 'Core',
  subject: 'Test issue description',
  priority: 'Alta',
  eta: '20/01/2024',
  rca: 'No asignado',
  ...overrides,
});

describe('WeeklyCorrectiveRepository (Integration)', () => {
  let repository: WeeklyCorrectiveRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new WeeklyCorrectiveRepository(db);
  });

  beforeEach(async () => {
    await repository.deleteAll();
  });

  describe('bulkCreate()', () => {
    it('should insert multiple records', async () => {
      await repository.bulkCreate([
        makeRecord({ requestId: 1001 }),
        makeRecord({ requestId: 1002 }),
        makeRecord({ requestId: 1003 }),
      ]);

      const total = await repository.countAll();
      expect(total).toBe(3);
    });

    it('should do nothing when given an empty array', async () => {
      await repository.bulkCreate([]);

      expect(await repository.countAll()).toBe(0);
    });

    it('should batch large inserts correctly', async () => {
      // Insert more than one batch (batchSize = 50)
      const records = Array.from({ length: 75 }, (_, i) =>
        makeRecord({ requestId: 2000 + i }),
      );

      await repository.bulkCreate(records);

      expect(await repository.countAll()).toBe(75);
    });
  });

  describe('findAll()', () => {
    it('should return all persisted records', async () => {
      await repository.bulkCreate([
        makeRecord({ requestId: 3001, requestStatus: 'Cerrada' }),
        makeRecord({ requestId: 3002, requestStatus: 'Abierta' }),
      ]);

      const results = await repository.findAll();

      expect(results.length).toBe(2);
      const statuses = results.map((r) => r.requestStatus);
      expect(statuses).toContain('Cerrada');
      expect(statuses).toContain('Abierta');
    });
  });

  describe('countAll()', () => {
    it('should return 0 when table is empty', async () => {
      expect(await repository.countAll()).toBe(0);
    });

    it('should return correct count after inserts', async () => {
      await repository.bulkCreate([
        makeRecord({ requestId: 4001 }),
        makeRecord({ requestId: 4002 }),
        makeRecord({ requestId: 4003 }),
      ]);

      expect(await repository.countAll()).toBe(3);
    });
  });

  describe('deleteAll()', () => {
    it('should remove all records and return affected count', async () => {
      await repository.bulkCreate([
        makeRecord({ requestId: 5001 }),
        makeRecord({ requestId: 5002 }),
      ]);

      const deleted = await repository.deleteAll();

      expect(deleted).toBeGreaterThanOrEqual(2);
      expect(await repository.countAll()).toBe(0);
    });
  });

  describe('findL3TicketsByStatus()', () => {
    it('should return empty data with correct structure when no records exist', async () => {
      const result = await repository.findL3TicketsByStatus();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('statusColumns');
      expect(result).toHaveProperty('monthName');
      expect(result).toHaveProperty('totalL3Tickets');
      expect(Array.isArray(result.data)).toBe(true);
      expect(Array.isArray(result.statusColumns)).toBe(true);
      expect(result.totalL3Tickets).toBe(0);
    });

    it('should aggregate records by application', async () => {
      await repository.bulkCreate([
        makeRecord({ requestId: 6001, aplicativos: 'App Alpha', requestStatus: 'En Pruebas', priority: 'Alta' }),
        makeRecord({ requestId: 6002, aplicativos: 'App Alpha', requestStatus: 'En Pruebas', priority: 'Media' }),
        makeRecord({ requestId: 6003, aplicativos: 'App Beta', requestStatus: 'Cerrada', priority: 'Baja' }),
      ]);

      const result = await repository.findL3TicketsByStatus();

      expect(result.totalL3Tickets).toBe(3);
      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return "All Time" as monthName when no month filter is given', async () => {
      const result = await repository.findL3TicketsByStatus();

      expect(result.monthName).toBe('All Time');
    });

    it('should set monthName to formatted month when month filter provided', async () => {
      const result = await repository.findL3TicketsByStatus(undefined, '2024-01');

      expect(result.monthName).toBe('January 2024');
    });
  });
});
