import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertMonthlyReport } from '@repo/database';

@Injectable()
export class MonthlyReportExcelParser {
  parse(buffer: Buffer): InsertMonthlyReport[] {
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Map Excel rows to database format
    const records: InsertMonthlyReport[] = data.map((row: any) => ({
      requestId: Number(row['Request ID']) || 0,
      aplicativos: String(row['Aplicativos'] || ''),
      categorizacion: String(row['Categorización'] || ''),
      createdTime: String(row['Created Time'] || ''),
      requestStatus: String(row['Request Status'] || ''),
      modulo: String(row['Modulo.'] || ''),
      subject: String(row['Subject'] || ''),
      priority: String(row['Priority'] || ''),
      eta: String(row['ETA'] || ''),
      informacionAdicional: String(row['Información Adicional'] || ''),
      resolvedTime: String(row['Resolved Time'] || ''),
      paisesAfectados: String(row['Países Afectados'] || ''),
      recurrencia: String(row['Recurrencia'] || ''),
      technician: String(row['Technician'] || ''),
      jira: String(row['Jira'] || ''),
      problemId: String(row['Problem ID'] || ''),
      linkedRequestId: String(row['Linked Request Id'] || ''),
      requestOlaStatus: String(row['Request OLA Status'] || ''),
      grupoEscalamiento: String(row['Grupo Escalamiento'] || ''),
      aplicactivosAfectados: String(row['Aplicactivos Afectados'] || ''),
      nivelUno: String(row['¿Este Incidente se debió Resolver en Nivel 1?'] || ''),
      campana: String(row['Campaña'] || ''),
      cuv: String(row['CUV_1'] || ''),
      release: String(row['Release'] || ''),
      rca: String(row['RCA'] || ''),
    }));

    return records;
  }
}
