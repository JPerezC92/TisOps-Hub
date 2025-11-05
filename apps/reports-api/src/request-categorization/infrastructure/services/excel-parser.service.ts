import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { RequestCategorizationEntity } from '../../domain/entities/request-categorization.entity';

const CATEGORY_HEADERS = [
  'Error de Alcance',
  'Error de codificación (Bug)',
  'Error de datos (Data Source)',
];

@Injectable()
export class ExcelParserService {
  parseExcelFile(buffer: Buffer): RequestCategorizationEntity[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error('No sheets found in workbook');
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in workbook`);
    }

    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    const parsedEntities: RequestCategorizationEntity[] = [];
    let currentCategory = 'Uncategorized';
    let currentRowIndex = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      currentRowIndex = i;

      if (!row || row.length === 0 || row.every((cell) => !cell)) {
        continue;
      }

      const firstCell = String(row[0] || '').trim();
      if (firstCell === 'Technician' || firstCell === 'Técnico') {
        continue;
      }

      const category = this.isCategoryHeader(row);
      if (category) {
        currentCategory = category;
        continue;
      }

      if (this.isDataRow(row)) {
        const requestIdLink = this.extractHyperlink(worksheet, currentRowIndex, 2);
        const linkedRequestIdLink = this.extractHyperlink(worksheet, currentRowIndex, 7);

        const entity = RequestCategorizationEntity.create(
          currentCategory,
          String(row[1] || '').trim(),
          String(row[2] || '').trim(),
          String(row[3] || '').trim(),
          String(row[4] || '').trim(),
          String(row[5] || '').trim(),
          String(row[6] || '').trim(),
          String(row[7] || '').trim(),
          requestIdLink,
          linkedRequestIdLink,
        );

        parsedEntities.push(entity);
      }
    }

    return parsedEntities;
  }

  private isCategoryHeader(row: any[]): string | null {
    for (let i = 0; i < Math.min(row.length, 5); i++) {
      const cellText = String(row[i] || '').trim();

      for (const category of CATEGORY_HEADERS) {
        if (cellText === category) {
          return category;
        }
      }
    }

    return null;
  }

  private isDataRow(row: any[]): boolean {
    const requestId = row[2];
    return requestId && !isNaN(Number(requestId));
  }

  private extractHyperlink(
    worksheet: XLSX.WorkSheet,
    rowIndex: number,
    colIndex: number,
  ): string | undefined {
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
    const cell = worksheet[cellAddress];

    if (cell && cell.l && cell.l.Target) {
      return cell.l.Target;
    }

    return undefined;
  }
}
