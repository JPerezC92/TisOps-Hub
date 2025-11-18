import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertProblem } from '@repo/database';

@Injectable()
export class ProblemsExcelParser {
  private decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };
    return text.replace(/&[a-z]+;|&#\d+;/gi, (match) => entities[match] || match);
  }

  private extractHyperlink(
    worksheet: XLSX.WorkSheet,
    rowIndex: number,
    colIndex: number,
  ): string | undefined {
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
    const cell = worksheet[cellAddress];

    if (cell && cell.l && cell.l.Target) {
      return this.decodeHTMLEntities(cell.l.Target);
    }

    return undefined;
  }

  parse(buffer: Buffer): InsertProblem[] {
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Map Excel rows to database format with hyperlink extraction
    const records: InsertProblem[] = data.map((row: any, index: number) => {
      const rowIndex = index + 1; // +1 because row 0 is header

      // Extract hyperlinks from specific columns:
      // Column C (index 2) = Request ID (contains work order link)
      // Column D (index 3) = Subject (contains work order link)
      const requestIdLink = this.extractHyperlink(worksheet, rowIndex, 2);
      const subjectLink = this.extractHyperlink(worksheet, rowIndex, 3);

      return {
        requestId: Number(row['Request ID']) || 0,
        requestIdLink: requestIdLink || undefined,
        serviceCategory: String(row['Service Category'] || ''),
        subject: String(row['Subject'] || ''),
        subjectLink: subjectLink || undefined,
        createdTime: String(row['Created Time'] || ''),
        aplicativos: String(row['Aplicativos'] || ''),
        createdBy: String(row['Created By'] || ''),
        planesDeAccion: String(row['Planes de Acción_1'] || ''),
        observaciones: String(row['Observaciones'] || ''),
        dueByTime: String(row['DueBy Time'] || ''),
      };
    });

    return records;
  }
}
