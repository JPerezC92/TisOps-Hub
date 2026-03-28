import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WarRoomsExcelParser } from '@war-rooms/infrastructure/parsers/war-rooms-excel.parser';
import * as XLSX from 'xlsx';

vi.mock('xlsx', () => ({
  default: {
    read: vi.fn(),
    utils: { sheet_to_json: vi.fn(), encode_cell: vi.fn() },
  },
  read: vi.fn(),
  utils: { sheet_to_json: vi.fn(), encode_cell: vi.fn() },
}));

// Excel serial for 2024-03-15 = 45365
const DATE_SERIAL = 45365;
// Time serial for 10:00 = 10/24 ≈ 0.4167
const START_TIME_SERIAL = 0.4167;
const END_TIME_SERIAL = 0.5;

const makeRow = (overrides: Record<string, any> = {}) => ({
  'Incident ID': '100001',
  'Application': 'Somos Belcorp',
  'Date': DATE_SERIAL,
  'Summary': 'Test incident summary',
  'Initial Priority': 'HIGH',
  'Start Time': START_TIME_SERIAL,
  'Duration (Minutes)': 60,
  'End Time': END_TIME_SERIAL,
  'Participants': 5,
  'Status': 'Closed',
  'Priority Changed': 'No',
  'Resolution team changed': 'No',
  'Notes': 'Some notes',
  'RCA Status': 'Completed',
  'URL RCA': 'https://example.com/rca',
  ...overrides,
});

const makeWorkbook = (sheetData: Record<string, any> = {}) => ({
  SheetNames: ['Sheet1'],
  Sheets: {
    Sheet1: { ...sheetData },
  },
});

describe('WarRoomsExcelParser', () => {
  let parser: WarRoomsExcelParser;

  beforeEach(() => {
    parser = new WarRoomsExcelParser();
    vi.clearAllMocks();
  });

  describe('parse()', () => {
    it('should map all fields from Excel row to InsertWarRoom', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);

      const result = parser.parse(Buffer.from('test'));

      expect(result).toHaveLength(1);
      expect(result[0]!.requestId).toBe(100001);
      expect(result[0]!.application).toBe('Somos Belcorp');
      expect(result[0]!.summary).toBe('Test incident summary');
      expect(result[0]!.initialPriority).toBe('HIGH');
      expect(result[0]!.durationMinutes).toBe(60);
      expect(result[0]!.participants).toBe(5);
      expect(result[0]!.status).toBe('Closed');
      expect(result[0]!.priorityChanged).toBe('No');
      expect(result[0]!.resolutionTeamChanged).toBe('No');
      expect(result[0]!.notes).toBe('Some notes');
      expect(result[0]!.rcaStatus).toBe('Completed');
      expect(result[0]!.urlRca).toBe('https://example.com/rca');
    });

    it('should convert Excel date serial to a Date object', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.date).toBeInstanceOf(Date);
      expect(result[0]!.startTime).toBeInstanceOf(Date);
      expect(result[0]!.endTime).toBeInstanceOf(Date);
    });

    it('should extract hyperlink from column C as requestIdLink', () => {
      const workbook = makeWorkbook({
        C2: { v: '100001', l: { Target: 'https://example.com/incident/100001' } },
      });
      vi.mocked(XLSX.read).mockReturnValue(workbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBe('https://example.com/incident/100001');
    });

    it('should decode HTML entities in requestIdLink', () => {
      const workbook = makeWorkbook({
        C2: { v: '100001', l: { Target: 'https://example.com?id=1&amp;mode=view' } },
      });
      vi.mocked(XLSX.read).mockReturnValue(workbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBe('https://example.com?id=1&mode=view');
    });

    it('should set requestIdLink to empty string when no hyperlink', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBe('');
    });

    it('should throw when Excel sheet is empty', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([]);

      expect(() => parser.parse(Buffer.from('test'))).toThrow('Excel file is empty');
    });

    it('should parse multiple rows', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
        makeRow({ 'Incident ID': '100001' }),
        makeRow({ 'Incident ID': '100002' }),
        makeRow({ 'Incident ID': '100003' }),
      ]);

      const result = parser.parse(Buffer.from('test'));

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.requestId)).toEqual([100001, 100002, 100003]);
    });

    it('should default numeric fields to 0 when missing', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
        makeRow({ 'Incident ID': undefined, 'Duration (Minutes)': undefined, 'Participants': undefined }),
      ]);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestId).toBe(0);
      expect(result[0]!.durationMinutes).toBe(0);
      expect(result[0]!.participants).toBe(0);
    });
  });
});
