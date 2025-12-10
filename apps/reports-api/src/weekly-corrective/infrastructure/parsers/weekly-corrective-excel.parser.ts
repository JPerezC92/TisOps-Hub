import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertWeeklyCorrective } from '@repo/database';

@Injectable()
export class WeeklyCorrectiveExcelParser {
  /**
   * Decode HTML entities in a string
   * Handles common entities like &amp;, &lt;, &gt;, &quot;, etc.
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };

    return text.replace(/&[a-z0-9#]+;/gi, (match) => {
      return entities[match.toLowerCase()] || match;
    });
  }

  parse(buffer: Buffer): InsertWeeklyCorrective[] {
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Get the range to find column positions for hyperlink extraction
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // Map Excel rows to database format with hyperlink extraction
    const records: InsertWeeklyCorrective[] = data.map((row: any, index: number) => {
      // Row index in Excel is index + 2 (header row + 0-based index)
      const excelRowNum = index + 2;

      // Find hyperlink for Request ID
      let requestIdLink: string | undefined;

      // Check columns for hyperlinks
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: excelRowNum - 1,
          c: col,
        });
        const cell = worksheet[cellAddress];

        if (cell && cell.l) {
          const header = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
          const headerValue = header?.v || header?.w || '';

          if (headerValue === 'Request ID') {
            requestIdLink = this.decodeHtmlEntities(cell.l.Target);
          }
        }
      }

      return {
        requestId: String(row['Request ID'] || ''),
        requestIdLink,
        technician: String(row['Technician'] || ''),
        aplicativos: String(row['Aplicativos'] || ''),
        categorizacion: String(row['Categorización'] || ''),
        createdTime: String(row['Created Time'] || ''),
        requestStatus: String(row['Request Status'] || ''),
        modulo: String(row['Modulo.'] || ''),
        subject: String(row['Subject'] || ''),
        priority: String(row['Priority'] || ''),
        eta: String(row['ETA'] || ''),
        rca: String(row['RCA'] || ''),
      };
    });

    return records;
  }
}
