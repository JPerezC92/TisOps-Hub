import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { SessionsOrdersRepository } from '@sessions-orders/infrastructure/repositories/sessions-orders.repository';
import { DateTime } from 'luxon';

describe('SessionsOrdersRepository (Integration)', () => {
  let repository: SessionsOrdersRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new SessionsOrdersRepository(db);
  });

  beforeEach(async () => {
    await repository.deleteAllMain();
    await repository.deleteAllReleases();
  });

  describe('bulkCreateMain() / findAllMain() / countMain()', () => {
    it('should insert multiple main records and retrieve them', async () => {
      await repository.bulkCreateMain([
        { ano: 2024, mes: 1, peak: 0, dia: 1704067200000, incidentes: 5, sessions: 100, placedOrders: 50, billedOrders: 45 },
        { ano: 2024, mes: 1, peak: 0, dia: 1704153600000, incidentes: 3, sessions: 120, placedOrders: 60, billedOrders: 55 },
      ]);

      const records = await repository.findAllMain();
      expect(records.length).toBe(2);
    });

    it('should return 0 when main table is empty', async () => {
      const total = await repository.countMain();
      expect(total).toBe(0);
    });

    it('should return correct count after insert', async () => {
      await repository.bulkCreateMain([
        { ano: 2024, mes: 2, peak: 0, dia: 1706745600000, incidentes: 2, sessions: 80, placedOrders: 40, billedOrders: 38 },
        { ano: 2024, mes: 2, peak: 1, dia: 1706832000000, incidentes: 8, sessions: 200, placedOrders: 100, billedOrders: 90 },
        { ano: 2024, mes: 2, peak: 0, dia: 1706918400000, incidentes: 1, sessions: 90, placedOrders: 45, billedOrders: 42 },
      ]);

      const total = await repository.countMain();
      expect(total).toBe(3);
    });

    it('should do nothing when inserting empty array', async () => {
      await repository.bulkCreateMain([]);

      const total = await repository.countMain();
      expect(total).toBe(0);
    });
  });

  describe('bulkCreateReleases() / findAllReleases() / countReleases()', () => {
    it('should insert multiple release records and retrieve them', async () => {
      await repository.bulkCreateReleases([
        { semana: '2024-W01', aplicacion: 'SB', fecha: 45292, release: 'v1.0.0', ticketsCount: 3, ticketsData: '["T-1","T-2","T-3"]' },
        { semana: '2024-W01', aplicacion: 'FFVV', fecha: 45292, release: 'v2.1.0', ticketsCount: 2, ticketsData: '["T-4","T-5"]' },
      ]);

      const records = await repository.findAllReleases();
      expect(records.length).toBe(2);
    });

    it('should return 0 when releases table is empty', async () => {
      const total = await repository.countReleases();
      expect(total).toBe(0);
    });

    it('should return correct count after insert', async () => {
      await repository.bulkCreateReleases([
        { semana: '2024-W02', aplicacion: 'SB', fecha: 45299, release: 'v1.0.1', ticketsCount: 1, ticketsData: '["T-6"]' },
      ]);

      const total = await repository.countReleases();
      expect(total).toBe(1);
    });
  });

  describe('deleteAllMain() / deleteAllReleases()', () => {
    it('should delete all main records and return affected count', async () => {
      await repository.bulkCreateMain([
        { ano: 2024, mes: 3, peak: 0, dia: 1709251200000, incidentes: 4, sessions: 110, placedOrders: 55, billedOrders: 50 },
      ]);

      const deleted = await repository.deleteAllMain();
      expect(deleted).toBeGreaterThanOrEqual(1);

      const total = await repository.countMain();
      expect(total).toBe(0);
    });

    it('should delete all release records and return affected count', async () => {
      await repository.bulkCreateReleases([
        { semana: '2024-W03', aplicacion: 'SB', fecha: 45306, release: 'v1.1.0', ticketsCount: 2, ticketsData: '["T-7","T-8"]' },
      ]);

      const deleted = await repository.deleteAllReleases();
      expect(deleted).toBeGreaterThanOrEqual(1);

      const total = await repository.countReleases();
      expect(total).toBe(0);
    });
  });

  describe('findLast30Days()', () => {
    it('should return empty data when no records exist', async () => {
      const result = await repository.findLast30Days();

      expect(result.data).toEqual([]);
    });

    it('should return at most 30 most recent records in ascending order', async () => {
      // Insert 35 records with different days
      const baseMs = DateTime.fromISO('2024-01-01').toMillis();
      const records = Array.from({ length: 35 }, (_, i) => ({
        ano: 2024,
        mes: 1,
        peak: 0,
        dia: baseMs + i * 86400000,
        incidentes: i,
        sessions: 100 + i,
        placedOrders: 50 + i,
        billedOrders: 45 + i,
      }));

      await repository.bulkCreateMain(records);

      const result = await repository.findLast30Days();

      expect(result.data.length).toBe(30);
      // Should be in ascending date order
      for (let i = 1; i < result.data.length; i++) {
        const prev = DateTime.fromISO(result.data[i - 1]!.date);
        const curr = DateTime.fromISO(result.data[i]!.date);
        expect(curr.toMillis()).toBeGreaterThanOrEqual(prev.toMillis());
      }
    });

    it('should map fields to correct output shape', async () => {
      const dayMs = DateTime.fromISO('2024-06-15').toMillis();
      await repository.bulkCreateMain([
        { ano: 2024, mes: 6, peak: 0, dia: dayMs, incidentes: 7, sessions: 150, placedOrders: 75, billedOrders: 70 },
      ]);

      const result = await repository.findLast30Days();

      expect(result.data.length).toBe(1);
      expect(result.data[0]!.incidents).toBe(7);
      expect(result.data[0]!.sessions).toBe(150);
      expect(result.data[0]!.placedOrders).toBe(75);
      expect(result.data[0]!.date).toBe('2024-06-15');
    });
  });

  describe('findIncidentsVsOrdersByMonth()', () => {
    it('should return empty data when no records exist', async () => {
      const result = await repository.findIncidentsVsOrdersByMonth();

      expect(result.data).toEqual([]);
    });

    it('should aggregate incidents and orders by month', async () => {
      await repository.bulkCreateMain([
        { ano: 2024, mes: 3, peak: 0, dia: 1709251200000, incidentes: 5, sessions: 100, placedOrders: 50, billedOrders: 45 },
        { ano: 2024, mes: 3, peak: 0, dia: 1709337600000, incidentes: 3, sessions: 110, placedOrders: 55, billedOrders: 50 },
        { ano: 2024, mes: 4, peak: 0, dia: 1711929600000, incidentes: 2, sessions: 90, placedOrders: 45, billedOrders: 40 },
      ]);

      const result = await repository.findIncidentsVsOrdersByMonth();

      const marchData = result.data.find((d) => d.monthNumber === 3);
      const aprilData = result.data.find((d) => d.monthNumber === 4);

      expect(marchData).toBeDefined();
      expect(marchData!.incidents).toBe(8); // 5 + 3
      expect(marchData!.placedOrders).toBe(105); // 50 + 55
      expect(marchData!.month).toBe('Mar');

      expect(aprilData).toBeDefined();
      expect(aprilData!.incidents).toBe(2);
    });

    it('should filter by year when provided', async () => {
      await repository.bulkCreateMain([
        { ano: 2023, mes: 1, peak: 0, dia: 1672531200000, incidentes: 10, sessions: 200, placedOrders: 100, billedOrders: 90 },
        { ano: 2024, mes: 1, peak: 0, dia: 1704067200000, incidentes: 4, sessions: 100, placedOrders: 50, billedOrders: 45 },
      ]);

      const result = await repository.findIncidentsVsOrdersByMonth(2024);

      expect(result.data.length).toBe(1);
      expect(result.data[0]!.incidents).toBe(4);
    });

    it('should return data sorted by month number', async () => {
      await repository.bulkCreateMain([
        { ano: 2024, mes: 6, peak: 0, dia: 1717200000000, incidentes: 1, sessions: 50, placedOrders: 25, billedOrders: 22 },
        { ano: 2024, mes: 2, peak: 0, dia: 1706745600000, incidentes: 2, sessions: 60, placedOrders: 30, billedOrders: 27 },
        { ano: 2024, mes: 9, peak: 0, dia: 1725148800000, incidentes: 3, sessions: 70, placedOrders: 35, billedOrders: 32 },
      ]);

      const result = await repository.findIncidentsVsOrdersByMonth(2024);

      const months = result.data.map((d) => d.monthNumber);
      const sorted = [...months].sort((a, b) => a - b);
      expect(months).toEqual(sorted);
    });
  });
});
