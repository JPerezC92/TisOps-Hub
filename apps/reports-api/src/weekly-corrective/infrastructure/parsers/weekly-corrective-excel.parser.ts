import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertWeeklyCorrective } from '@repo/database';

@Injectable()
export class WeeklyCorrectiveExcelParser {
  parse(buffer: Buffer): InsertWeeklyCorrective[] {
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Map Excel rows to database format
    const records: InsertWeeklyCorrective[] = data.map((row: any) => ({
      requestId: String(row['Request ID'] || ''),
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
    }));

    return records;
  }
}
