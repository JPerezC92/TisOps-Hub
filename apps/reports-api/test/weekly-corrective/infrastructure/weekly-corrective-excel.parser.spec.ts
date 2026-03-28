import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeeklyCorrectiveExcelParser } from '@weekly-corrective/infrastructure/parsers/weekly-corrective-excel.parser';
import * as XLSX from 'xlsx';

vi.mock('xlsx', () => ({
  default: {
    read: vi.fn(),
    utils: { sheet_to_json: vi.fn(), encode_cell: vi.fn(), decode_range: vi.fn() },
  },
  read: vi.fn(),
  utils: { sheet_to_json: vi.fn(), encode_cell: vi.fn(), decode_range: vi.fn() },
}));

const makeRow = (overrides: Record<string, any> = {}) => ({
  'Request ID': '200001',
  'Technician': 'John Doe',
  'Aplicativos': 'Somos Belcorp',
  'Categorización': 'Bug',
  'Created Time': '15/01/2024 10:30',
  'Request Status': 'En Pruebas',
  'Modulo.': 'Core',
  'Subject': 'Test corrective subject',
  'Priority': 'Alta',
  'ETA': '20/01/2024',
  'RCA': 'No asignado',
  ...overrides,
});

const makeWorkbook = (sheetData: Record<string, any> = {}) => ({
  SheetNames: ['Sheet1'],
  Sheets: {
    Sheet1: {
      '!ref': 'A1:K2',
      ...sheetData,
    },
  },
});

describe('WeeklyCorrectiveExcelParser', () => {
  let parser: WeeklyCorrectiveExcelParser;

  beforeEach(() => {
    parser = new WeeklyCorrectiveExcelParser();
    vi.clearAllMocks();
  });

  describe('parse()', () => {
    it('should map all fields from Excel row to InsertWeeklyCorrective', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 10 } });

      const result = parser.parse(Buffer.from('test'));

      expect(result).toHaveLength(1);
      expect(result[0]!.requestId).toBe(200001);
      expect(result[0]!.technician).toBe('John Doe');
      expect(result[0]!.aplicativos).toBe('Somos Belcorp');
      expect(result[0]!.categorizacion).toBe('Bug');
      expect(result[0]!.createdTime).toBe('15/01/2024 10:30');
      expect(result[0]!.requestStatus).toBe('En Pruebas');
      expect(result[0]!.modulo).toBe('Core');
      expect(result[0]!.subject).toBe('Test corrective subject');
      expect(result[0]!.priority).toBe('Alta');
      expect(result[0]!.eta).toBe('20/01/2024');
      expect(result[0]!.rca).toBe('No asignado');
    });

    it('should extract requestIdLink from hyperlink on Request ID column', () => {
      // Simulate a worksheet with a hyperlink on the Request ID cell at row 2, col 0 (A2)
      const workbook = makeWorkbook({
        A1: { v: 'Request ID', w: 'Request ID' }, // header
        A2: { v: '200001', l: { Target: 'https://sdp.example.com/wo/200001' } },
      });
      vi.mocked(XLSX.read).mockReturnValue(workbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBe('https://sdp.example.com/wo/200001');
    });

    it('should decode HTML entities in requestIdLink', () => {
      const workbook = makeWorkbook({
        A1: { v: 'Request ID', w: 'Request ID' },
        A2: { v: '200001', l: { Target: 'https://sdp.example.com?id=1&amp;mode=view' } },
      });
      vi.mocked(XLSX.read).mockReturnValue(workbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBe('https://sdp.example.com?id=1&mode=view');
    });

    it('should set requestIdLink to undefined when no hyperlink found', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBeUndefined();
    });

    it('should throw when Excel sheet is empty', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });

      expect(() => parser.parse(Buffer.from('test'))).toThrow('Excel file is empty');
    });

    it('should parse multiple rows', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
        makeRow({ 'Request ID': '200001' }),
        makeRow({ 'Request ID': '200002' }),
      ]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.requestId)).toEqual([200001, 200002]);
    });

    it('should default requestId to 0 when missing', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ 'Request ID': undefined })]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestId).toBe(0);
    });
  });
});
