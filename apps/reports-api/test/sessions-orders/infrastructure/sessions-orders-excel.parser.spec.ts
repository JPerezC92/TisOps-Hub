import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionsOrdersExcelParser } from '@sessions-orders/infrastructure/parsers/sessions-orders-excel.parser';
import * as XLSX from 'xlsx';

vi.mock('xlsx', () => ({
  default: {
    read: vi.fn(),
    utils: { sheet_to_json: vi.fn() },
  },
  read: vi.fn(),
  utils: { sheet_to_json: vi.fn() },
}));

const makeHoja1Row = (overrides: Record<string, any> = {}) => ({
  'año': 2024,
  'mes': 3,
  'peak': 0,
  'dia': new Date('2024-03-15'),
  'incidentes': 5,
  'session': 100,
  'placed orders': 50,
  'billed orders': 45,
  ...overrides,
});

const makeHoja3Row = (overrides: Record<string, any> = {}) => ({
  'SEMANA': '2024-W11',
  'APLICACIÓN': 'SB',
  'FECHA': 45366,
  'RELEASE': 'v1.0.0',
  'tickets ': 3,
  '# TICKETS': 'T-001',
  '__EMPTY': 'T-002',
  '__EMPTY_1': 'T-003',
  ...overrides,
});

const makeWorkbook = (hoja1Data: any[], hoja3Data: any[] = []) => {
  const workbook: any = {
    SheetNames: ['Hoja1', 'Hoja3'],
    Sheets: {
      Hoja1: {},
      Hoja3: {},
    },
  };

  // Mock sheet_to_json to return appropriate data per sheet
  vi.mocked(XLSX.utils.sheet_to_json).mockImplementation((sheet: any) => {
    if (sheet === workbook.Sheets['Hoja1']) return hoja1Data;
    if (sheet === workbook.Sheets['Hoja3']) return hoja3Data;
    return [];
  });

  return workbook;
};

describe('SessionsOrdersExcelParser', () => {
  let parser: SessionsOrdersExcelParser;

  beforeEach(() => {
    parser = new SessionsOrdersExcelParser();
    vi.clearAllMocks();
  });

  describe('parse()', () => {
    it('should map Hoja1 rows to mainRecords', () => {
      const workbook = makeWorkbook([makeHoja1Row()]);
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      const result = parser.parse(Buffer.from('test'));

      expect(result.mainRecords).toHaveLength(1);
      expect(result.mainRecords[0]!.ano).toBe(2024);
      expect(result.mainRecords[0]!.mes).toBe(3);
      expect(result.mainRecords[0]!.peak).toBe(0);
      expect(result.mainRecords[0]!.incidentes).toBe(5);
      expect(result.mainRecords[0]!.sessions).toBe(100);
      expect(result.mainRecords[0]!.placedOrders).toBe(50);
      expect(result.mainRecords[0]!.billedOrders).toBe(45);
    });

    it('should convert Date object in "dia" to Unix timestamp', () => {
      const date = new Date('2024-03-15');
      const workbook = makeWorkbook([makeHoja1Row({ dia: date })]);
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      const result = parser.parse(Buffer.from('test'));

      expect(result.mainRecords[0]!.dia).toBe(date.getTime());
    });

    it('should convert Excel serial in "dia" to Unix timestamp', () => {
      // Excel serial 45365 = 2024-03-14
      const workbook = makeWorkbook([makeHoja1Row({ dia: 45365 })]);
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      const result = parser.parse(Buffer.from('test'));

      const expectedMs = (45365 - 25569) * 86400 * 1000;
      expect(result.mainRecords[0]!.dia).toBe(expectedMs);
    });

    it('should map Hoja3 rows to releaseRecords', () => {
      const workbook = makeWorkbook([makeHoja1Row()], [makeHoja3Row()]);
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      const result = parser.parse(Buffer.from('test'));

      expect(result.releaseRecords).toHaveLength(1);
      expect(result.releaseRecords[0]!.semana).toBe('2024-W11');
      expect(result.releaseRecords[0]!.aplicacion).toBe('SB');
      expect(result.releaseRecords[0]!.release).toBe('v1.0.0');
      expect(result.releaseRecords[0]!.ticketsCount).toBe(3);
    });

    it('should aggregate tickets from # TICKETS and __EMPTY columns', () => {
      const workbook = makeWorkbook([makeHoja1Row()], [
        makeHoja3Row({ '# TICKETS': 'T-001', '__EMPTY': 'T-002', '__EMPTY_1': 'T-003' }),
      ]);
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      const result = parser.parse(Buffer.from('test'));

      const tickets = JSON.parse(result.releaseRecords[0]!.ticketsData);
      expect(tickets).toContain('T-001');
      expect(tickets).toContain('T-002');
      expect(tickets).toContain('T-003');
    });

    it('should return empty releaseRecords when Hoja3 is absent', () => {
      const workbook: any = {
        SheetNames: ['Hoja1'],
        Sheets: { Hoja1: {} },
      };
      vi.mocked(XLSX.read).mockReturnValue(workbook);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeHoja1Row()]);

      const result = parser.parse(Buffer.from('test'));

      expect(result.releaseRecords).toEqual([]);
    });

    it('should throw when Hoja1 sheet is missing', () => {
      const workbook: any = {
        SheetNames: ['Hoja3'],
        Sheets: { Hoja3: {} },
      };
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      expect(() => parser.parse(Buffer.from('test'))).toThrow('Main sheet (Hoja1) not found');
    });

    it('should throw when Hoja1 is empty', () => {
      const workbook = makeWorkbook([]);
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      expect(() => parser.parse(Buffer.from('test'))).toThrow('Main sheet (Hoja1) is empty');
    });

    it('should parse multiple Hoja1 rows', () => {
      const workbook = makeWorkbook([makeHoja1Row({ mes: 1 }), makeHoja1Row({ mes: 2 }), makeHoja1Row({ mes: 3 })]);
      vi.mocked(XLSX.read).mockReturnValue(workbook);

      const result = parser.parse(Buffer.from('test'));

      expect(result.mainRecords).toHaveLength(3);
    });
  });
});
