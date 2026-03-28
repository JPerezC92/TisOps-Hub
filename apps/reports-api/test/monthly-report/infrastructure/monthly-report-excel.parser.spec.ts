import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MonthlyReportExcelParser } from '@monthly-report/infrastructure/parsers/monthly-report-excel.parser';
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
  'Request ID': '300001',
  'Aplicativos': 'Somos Belcorp',
  'Categorización': 'Bug',
  'Created Time': '15/06/2024 10:30',
  'Request Status': 'Nivel 2',
  'Modulo.': 'Core',
  'Subject': 'Test monthly report subject',
  'Priority': 'Alta',
  'ETA': 'No asignado',
  'Información Adicional': 'Team Alpha',
  'Resolved Time': 'No asignado',
  'Países Afectados': 'PE',
  'Recurrencia': 'No',
  'Technician': 'Jane Doe',
  'Jira': 'No asignado',
  'Problem ID': 'PROB-001',
  'Linked Request Id': 'LR-PARENT-001',
  'Request OLA Status': 'Not Violated',
  'Grupo Escalamiento': 'L2',
  'Aplicactivos Afectados': 'App A',
  '¿Este Incidente se debió Resolver en Nivel 1?': 'No',
  'Campaña': 'N/A',
  'CUV_1': 'N/A',
  'Release': 'N/A',
  'RCA': 'No asignado',
  ...overrides,
});

const makeWorkbook = (sheetData: Record<string, any> = {}) => ({
  SheetNames: ['Sheet1'],
  Sheets: {
    Sheet1: {
      '!ref': 'A1:Z2',
      ...sheetData,
    },
  },
});

describe('MonthlyReportExcelParser', () => {
  let parser: MonthlyReportExcelParser;

  beforeEach(() => {
    parser = new MonthlyReportExcelParser();
    vi.clearAllMocks();
    vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
    vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);
  });

  describe('parse()', () => {
    it('should map all fields from Excel row to InsertMonthlyReport', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);

      const result = parser.parse(Buffer.from('test'));

      expect(result).toHaveLength(1);
      expect(result[0]!.requestId).toBe(300001);
      expect(result[0]!.aplicativos).toBe('Somos Belcorp');
      expect(result[0]!.categorizacion).toBe('Bug');
      expect(result[0]!.requestStatus).toBe('Nivel 2');
      expect(result[0]!.modulo).toBe('Core');
      expect(result[0]!.subject).toBe('Test monthly report subject');
      expect(result[0]!.priority).toBe('High'); // translated from 'Alta'
      expect(result[0]!.technician).toBe('Jane Doe');
      expect(result[0]!.linkedRequestId).toBe('LR-PARENT-001');
    });

    it('should parse createdTime into a Date object', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ 'Created Time': '15/06/2024 10:30' })]);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.createdTime).toBeInstanceOf(Date);
      const date = result[0]!.createdTime as Date;
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(5); // June = index 5
      expect(date.getDate()).toBe(15);
    });

    it('should translate Spanish priorities to English', () => {
      const priorities: [string, string][] = [
        ['Baja', 'Low'],
        ['Media', 'Medium'],
        ['Alta', 'High'],
        ['Crítica', 'Critical'],
        ['Critica', 'Critical'],
      ];

      for (const [spanish, english] of priorities) {
        vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
        vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ Priority: spanish })]);
        vi.clearAllMocks();
        vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
        vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ Priority: spanish })]);
        vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
        vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

        const result = parser.parse(Buffer.from('test'));
        expect(result[0]!.priority).toBe(english);
      }
    });

    it('should throw on invalid priority value', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ Priority: 'Urgente' })]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      expect(() => parser.parse(Buffer.from('test'))).toThrow("Invalid priority value 'Urgente'");
    });

    it('should throw on invalid date format', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ 'Created Time': '2024-06-15' })]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      expect(() => parser.parse(Buffer.from('test'))).toThrow('Invalid date format');
    });

    it('should extract requestIdLink hyperlink from Request ID column', () => {
      const workbook = makeWorkbook({
        A1: { v: 'Request ID', w: 'Request ID' },
        A2: { v: '300001', l: { Target: 'https://sdp.example.com/wo/300001' } },
      });
      vi.mocked(XLSX.read).mockReturnValue(workbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBe('https://sdp.example.com/wo/300001');
    });

    it('should extract linkedRequestIdLink hyperlink from Linked Request Id column', () => {
      const workbook = makeWorkbook({
        A1: { v: 'Linked Request Id', w: 'Linked Request Id' },
        A2: { v: 'LR-001', l: { Target: 'https://sdp.example.com/wo/LR-001' } },
      });
      vi.mocked(XLSX.read).mockReturnValue(workbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.linkedRequestIdLink).toBe('https://sdp.example.com/wo/LR-001');
    });

    it('should construct fallback linkedRequestIdLink when no hyperlink and linkedRequestId is not "No asignado"', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ 'Linked Request Id': '99999' })]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.linkedRequestIdLink).toBe('https://sdp.belcorp.biz/WorkOrder.do?woMode=viewWO&woID=99999');
    });

    it('should not set linkedRequestIdLink when linkedRequestId is "No asignado"', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ 'Linked Request Id': 'No asignado' })]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.linkedRequestIdLink).toBeUndefined();
    });

    it('should decode HTML entities in hyperlinks', () => {
      const workbook = makeWorkbook({
        A1: { v: 'Request ID', w: 'Request ID' },
        A2: { v: '300001', l: { Target: 'https://sdp.example.com?id=1&amp;mode=view' } },
      });
      vi.mocked(XLSX.read).mockReturnValue(workbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow()]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestIdLink).toBe('https://sdp.example.com?id=1&mode=view');
    });

    it('should throw when Excel sheet is empty', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });

      expect(() => parser.parse(Buffer.from('test'))).toThrow('Excel file is empty');
    });

    it('should strip extra whitespace from requestStatus', () => {
      vi.mocked(XLSX.read).mockReturnValue(makeWorkbook() as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([makeRow({ 'Request Status': '  Nivel 2  ' })]);
      vi.mocked(XLSX.utils.decode_range as any).mockReturnValue({ s: { c: 0 }, e: { c: 0 } });
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`);

      const result = parser.parse(Buffer.from('test'));

      expect(result[0]!.requestStatus).toBe('Nivel 2');
    });
  });
});
