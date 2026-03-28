import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { MonthlyReportRepository } from '@monthly-report/infrastructure/repositories/monthly-report.repository';

let counter = 0;
const makeRecord = (
  overrides: Partial<Parameters<MonthlyReportRepository['bulkCreate']>[0][0]> = {},
) => {
  counter++;
  return {
    requestId: 1_000_000 + counter,
    aplicativos: 'Test App',
    categorizacion: 'Bug',
    createdTime: new Date('2024-06-15T10:00:00'),
    requestStatus: 'Nivel 2',
    modulo: 'Core',
    subject: `Test subject ${counter}`,
    priority: 'Medium',
    eta: 'No asignado',
    informacionAdicional: 'Team Alpha',
    resolvedTime: 'No asignado',
    paisesAfectados: 'PE',
    recurrencia: 'No',
    technician: 'Jane Doe',
    jira: 'No asignado',
    problemId: `PROB-${counter}`,
    linkedRequestId: 'LR-PARENT-001',
    requestOlaStatus: 'Not Violated',
    grupoEscalamiento: 'L2',
    aplicactivosAfectados: 'App A',
    nivelUno: 'No',
    campana: 'N/A',
    cuv: 'N/A',
    release: 'N/A',
    rca: 'No asignado',
    ...overrides,
  };
};

describe('MonthlyReportRepository (Integration)', () => {
  let repository: MonthlyReportRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new MonthlyReportRepository(db);
  });

  beforeEach(async () => {
    await repository.deleteAll();
    counter = 0;
  });

  describe('bulkCreate()', () => {
    it('should insert multiple records', async () => {
      await repository.bulkCreate([makeRecord(), makeRecord(), makeRecord()]);

      expect(await repository.countAll()).toBe(3);
    });

    it('should do nothing when given an empty array', async () => {
      await repository.bulkCreate([]);

      expect(await repository.countAll()).toBe(0);
    });

    it('should batch large inserts correctly (batch size = 5)', async () => {
      const records = Array.from({ length: 12 }, () => makeRecord());

      await repository.bulkCreate(records);

      expect(await repository.countAll()).toBe(12);
    });
  });

  describe('findAll()', () => {
    it('should return all records with a displayStatus field', async () => {
      await repository.bulkCreate([makeRecord(), makeRecord()]);

      const results = await repository.findAll();

      expect(results.length).toBe(2);
      // displayStatus comes from LEFT JOIN with monthly_report_status_registry
      // when no mapping exists, COALESCE falls back to DEFAULT_DISPLAY_STATUS
      expect(results[0]).toHaveProperty('displayStatus');
      expect(typeof results[0]!.displayStatus).toBe('string');
    });

    it('should return records with all expected fields', async () => {
      await repository.bulkCreate([
        makeRecord({ requestStatus: 'Nivel 3', priority: 'High', modulo: 'Payments' }),
      ]);

      const results = await repository.findAll();

      expect(results[0]!.requestStatus).toBe('Nivel 3');
      expect(results[0]!.priority).toBe('High');
      expect(results[0]!.modulo).toBe('Payments');
    });
  });

  describe('countAll()', () => {
    it('should return 0 when table is empty', async () => {
      expect(await repository.countAll()).toBe(0);
    });

    it('should return correct count after inserts', async () => {
      await repository.bulkCreate([makeRecord(), makeRecord()]);

      expect(await repository.countAll()).toBe(2);
    });
  });

  describe('deleteAll()', () => {
    it('should remove all records and return affected count', async () => {
      await repository.bulkCreate([makeRecord(), makeRecord(), makeRecord()]);

      const deleted = await repository.deleteAll();

      expect(deleted).toBeGreaterThanOrEqual(3);
      expect(await repository.countAll()).toBe(0);
    });
  });

  describe('findIncidentsByDay()', () => {
    it('should return empty data when no records exist', async () => {
      const result = await repository.findIncidentsByDay();

      expect(result.data).toEqual([]);
      expect(result.totalIncidents).toBe(0);
    });

    it('should group incidents by day of month', async () => {
      await repository.bulkCreate([
        makeRecord({ createdTime: new Date('2024-06-01T10:00:00') }),
        makeRecord({ createdTime: new Date('2024-06-01T14:00:00') }), // same day
        makeRecord({ createdTime: new Date('2024-06-15T10:00:00') }),
      ]);

      const result = await repository.findIncidentsByDay();

      expect(result.totalIncidents).toBe(3);
      const day1 = result.data.find((d) => d.day === 1);
      const day15 = result.data.find((d) => d.day === 15);

      expect(day1?.count).toBe(2);
      expect(day15?.count).toBe(1);
    });

    it('should return data sorted ascending by day', async () => {
      await repository.bulkCreate([
        makeRecord({ createdTime: new Date('2024-06-20T10:00:00') }),
        makeRecord({ createdTime: new Date('2024-06-05T10:00:00') }),
        makeRecord({ createdTime: new Date('2024-06-12T10:00:00') }),
      ]);

      const result = await repository.findIncidentsByDay();

      const days = result.data.map((d) => d.day);
      const sorted = [...days].sort((a, b) => a - b);
      expect(days).toEqual(sorted);
    });
  });

  describe('findCriticalIncidentsFiltered()', () => {
    it('should return empty array when no records exist', async () => {
      const result = await repository.findCriticalIncidentsFiltered();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return records when data exists', async () => {
      await repository.bulkCreate([
        makeRecord({ priority: 'Critical', requestStatus: 'Nivel 2' }),
        makeRecord({ priority: 'Medium', requestStatus: 'Nivel 2' }),
      ]);

      const result = await repository.findCriticalIncidentsFiltered();

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by month', async () => {
      await repository.bulkCreate([
        makeRecord({ priority: 'Critical', createdTime: new Date('2024-03-10T10:00:00') }),
        makeRecord({ priority: 'Critical', createdTime: new Date('2024-07-10T10:00:00') }),
      ]);

      const marchResults = await repository.findCriticalIncidentsFiltered(undefined, '2024-03');
      const julyResults = await repository.findCriticalIncidentsFiltered(undefined, '2024-07');

      expect(marchResults.length).toBe(1);
      expect(julyResults.length).toBe(1);
    });
  });

  describe('upsertSubjectTranslations() / findSubjectTranslations()', () => {
    it('should insert translations and retrieve them by requestId', async () => {
      await repository.upsertSubjectTranslations([
        { requestId: 9001, subject: 'Error en pago', subjectEnglish: 'Payment error' },
        { requestId: 9002, subject: 'Falla en login', subjectEnglish: 'Login failure' },
      ]);

      const results = await repository.findSubjectTranslations([9001, 9002]);

      expect(results.length).toBe(2);
      const found = results.find((r) => r.requestId === 9001);
      expect(found?.subjectEnglish).toBe('Payment error');
    });

    it('should return empty array for empty requestIds list', async () => {
      const results = await repository.findSubjectTranslations([]);
      expect(results).toEqual([]);
    });

    it('should update existing translation on conflict', async () => {
      await repository.upsertSubjectTranslations([
        { requestId: 9010, subject: 'Original', subjectEnglish: 'Original EN' },
      ]);

      await repository.upsertSubjectTranslations([
        { requestId: 9010, subject: 'Updated', subjectEnglish: 'Updated EN' },
      ]);

      const results = await repository.findSubjectTranslations([9010]);
      expect(results.length).toBe(1);
      expect(results[0]!.subjectEnglish).toBe('Updated EN');
    });

    it('should only return translations for requested ids', async () => {
      await repository.upsertSubjectTranslations([
        { requestId: 9020, subject: 'A', subjectEnglish: 'A EN' },
        { requestId: 9021, subject: 'B', subjectEnglish: 'B EN' },
        { requestId: 9022, subject: 'C', subjectEnglish: 'C EN' },
      ]);

      const results = await repository.findSubjectTranslations([9020, 9022]);
      expect(results.length).toBe(2);
      expect(results.map((r) => r.requestId)).not.toContain(9021);
    });
  });
});
