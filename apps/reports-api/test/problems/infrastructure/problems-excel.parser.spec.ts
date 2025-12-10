import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProblemsExcelParser } from '@problems/infrastructure/parsers/problems-excel.parser';
import * as XLSX from 'xlsx';

vi.mock('xlsx', () => ({
  default: {
    read: vi.fn(),
    utils: {
      sheet_to_json: vi.fn(),
      encode_cell: vi.fn(),
    },
  },
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
    encode_cell: vi.fn(),
  },
}));

describe('ProblemsExcelParser', () => {
  let parser: ProblemsExcelParser;

  beforeEach(() => {
    parser = new ProblemsExcelParser();
    vi.clearAllMocks();
  });

  describe('parse', () => {
    it('should parse Excel file and extract data successfully', () => {
      const mockWorkbook = {
        SheetNames: ['ManageEngine Report Framework'],
        Sheets: {
          'ManageEngine Report Framework': {
            'C2': { v: '131205', l: { Target: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205' } },
            'E2': { v: 'Test Subject', l: { Target: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205' } },
          },
        },
      };

      const mockData = [
        {
          'Request ID': '131205',
          'Service Category': 'Problemas',
          'Subject': 'UNETE 4 | VALIDACION | Test',
          'Created Time': '17/10/2025 11:34',
          'Aplicativos': 'Unete 3.0',
          'Created By': 'John Doe',
          'Planes de Acción_1': 'Plan A',
          'Observaciones': 'Some observations',
          'DueBy Time': '25/11/2025 11:34',
        },
        {
          'Request ID': '129476',
          'Service Category': 'Problemas',
          'Subject': 'DATA SOURCE Test',
          'Created Time': '10/10/2025 18:34',
          'Aplicativos': 'Unete 3.0',
          'Created By': 'Jane Smith',
          'Planes de Acción_1': 'No asignado',
          'Observaciones': 'No asignado',
          'DueBy Time': '19/11/2025 18:00',
        },
      ];

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(mockData);
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => {
        const col = String.fromCharCode(65 + cell.c);
        const row = cell.r + 1;
        return `${col}${row}`;
      });

      const buffer = Buffer.from('test');
      const result = parser.parse(buffer);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        requestId: 131205,
        requestIdLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
        serviceCategory: 'Problemas',
        requestStatus: '',
        subject: 'UNETE 4 | VALIDACION | Test',
        subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
        createdTime: '17/10/2025 11:34',
        aplicativos: 'Unete 3.0',
        createdBy: 'John Doe',
        technician: '',
        planesDeAccion: 'Plan A',
        observaciones: 'Some observations',
        dueByTime: '25/11/2025 11:34',
      });
      expect(result[1].requestId).toBe(129476);
      expect(result[1].planesDeAccion).toBe('No asignado');
    });

    it('should extract hyperlinks from Request ID column', () => {
      const mockWorkbook = {
        SheetNames: ['ManageEngine Report Framework'],
        Sheets: {
          'ManageEngine Report Framework': {
            'C2': {
              v: '131205',
              l: { Target: 'https://sdp.belcorp.biz/WorkOrder.do?PORTALID=1&amp;woMode=viewWO&amp;woID=131205' },
            },
            'D2': { v: 'Test Subject' },
          },
        },
      };

      const mockData = [
        {
          'Request ID': '131205',
          'Service Category': 'Problemas',
          'Subject': 'Test Subject',
          'Created Time': '17/10/2025 11:34',
          'Aplicativos': 'Unete 3.0',
          'Created By': 'John Doe',
          'Planes de Acción_1': 'Plan A',
          'Observaciones': 'Observations',
          'DueBy Time': '25/11/2025 11:34',
        },
      ];

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(mockData);
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => {
        const col = String.fromCharCode(65 + cell.c);
        const row = cell.r + 1;
        return `${col}${row}`;
      });

      const buffer = Buffer.from('test');
      const result = parser.parse(buffer);

      expect(result[0].requestIdLink).toBe(
        'https://sdp.belcorp.biz/WorkOrder.do?PORTALID=1&woMode=viewWO&woID=131205',
      );
    });

    it('should extract hyperlinks from Subject column', () => {
      const mockWorkbook = {
        SheetNames: ['ManageEngine Report Framework'],
        Sheets: {
          'ManageEngine Report Framework': {
            'C2': { v: '131205' },
            'E2': {
              v: 'Test Subject',
              l: { Target: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205' },
            },
          },
        },
      };

      const mockData = [
        {
          'Request ID': '131205',
          'Service Category': 'Problemas',
          'Subject': 'Test Subject',
          'Created Time': '17/10/2025 11:34',
          'Aplicativos': 'Unete 3.0',
          'Created By': 'John Doe',
          'Planes de Acción_1': 'Plan A',
          'Observaciones': 'Observations',
          'DueBy Time': '25/11/2025 11:34',
        },
      ];

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(mockData);
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => {
        const col = String.fromCharCode(65 + cell.c);
        const row = cell.r + 1;
        return `${col}${row}`;
      });

      const buffer = Buffer.from('test');
      const result = parser.parse(buffer);

      expect(result[0].subjectLink).toBe('https://sdp.belcorp.biz/WorkOrder.do?woID=131205');
    });

    it('should decode HTML entities in hyperlinks', () => {
      const mockWorkbook = {
        SheetNames: ['ManageEngine Report Framework'],
        Sheets: {
          'ManageEngine Report Framework': {
            'C2': {
              v: '131205',
              l: {
                Target:
                  'https://sdp.belcorp.biz/WorkOrder.do?PORTALID=1&amp;woMode=viewWO&amp;woID=131205&quot;test&quot;',
              },
            },
            'D2': { v: 'Subject' },
          },
        },
      };

      const mockData = [
        {
          'Request ID': '131205',
          'Service Category': 'Problemas',
          'Subject': 'Subject',
          'Created Time': '17/10/2025 11:34',
          'Aplicativos': 'Unete 3.0',
          'Created By': 'John Doe',
          'Planes de Acción_1': 'Plan A',
          'Observaciones': 'Obs',
          'DueBy Time': '25/11/2025 11:34',
        },
      ];

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(mockData);
      vi.mocked(XLSX.utils.encode_cell).mockImplementation((cell: any) => {
        const col = String.fromCharCode(65 + cell.c);
        const row = cell.r + 1;
        return `${col}${row}`;
      });

      const buffer = Buffer.from('test');
      const result = parser.parse(buffer);

      // HTML entities should be decoded: &amp; -> &, &quot; -> "
      expect(result[0].requestIdLink).toBe(
        'https://sdp.belcorp.biz/WorkOrder.do?PORTALID=1&woMode=viewWO&woID=131205"test"',
      );
    });

    it('should handle missing optional fields gracefully', () => {
      const mockWorkbook = {
        SheetNames: ['ManageEngine Report Framework'],
        Sheets: {
          'ManageEngine Report Framework': {},
        },
      };

      const mockData = [
        {
          'Request ID': '131205',
          'Service Category': 'Problemas',
          'Subject': 'Test',
          'Created Time': '17/10/2025 11:34',
          'Aplicativos': 'Unete 3.0',
          'Created By': 'John Doe',
          'Planes de Acción_1': '', // Empty
          'Observaciones': '', // Empty
          'DueBy Time': '25/11/2025 11:34',
        },
      ];

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(mockData);

      const buffer = Buffer.from('test');
      const result = parser.parse(buffer);

      expect(result[0].planesDeAccion).toBe('');
      expect(result[0].observaciones).toBe('');
      expect(result[0].requestIdLink).toBeUndefined();
      expect(result[0].subjectLink).toBeUndefined();
    });

    it('should throw error when Excel file is empty', () => {
      const mockWorkbook = {
        SheetNames: ['ManageEngine Report Framework'],
        Sheets: {
          'ManageEngine Report Framework': {},
        },
      };

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([]);

      const buffer = Buffer.from('test');

      expect(() => parser.parse(buffer)).toThrow('Excel file is empty');
    });

    it('should convert requestId to number', () => {
      const mockWorkbook = {
        SheetNames: ['ManageEngine Report Framework'],
        Sheets: {
          'ManageEngine Report Framework': {},
        },
      };

      const mockData = [
        {
          'Request ID': '131205', // String in Excel
          'Service Category': 'Problemas',
          'Subject': 'Test',
          'Created Time': '17/10/2025 11:34',
          'Aplicativos': 'Unete 3.0',
          'Created By': 'John Doe',
          'Planes de Acción_1': 'Plan A',
          'Observaciones': 'Obs',
          'DueBy Time': '25/11/2025 11:34',
        },
      ];

      vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(mockData);

      const buffer = Buffer.from('test');
      const result = parser.parse(buffer);

      expect(typeof result[0].requestId).toBe('number');
      expect(result[0].requestId).toBe(131205);
    });
  });
});
