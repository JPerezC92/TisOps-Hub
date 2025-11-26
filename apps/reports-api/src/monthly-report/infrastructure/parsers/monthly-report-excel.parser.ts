import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { InsertMonthlyReport } from '@repo/database';
import { Priority, PrioritySpanish } from '@repo/reports';

@Injectable()
export class MonthlyReportExcelParser {
  private translatePriorityToEnglish(
    spanishPriority: string,
    rowIndex: number,
  ): string {
    const normalized = spanishPriority?.trim().toLowerCase();

    const priorityMap: Record<string, string> = {
      baja: Priority.Low,
      media: Priority.Medium,
      alta: Priority.High,
      crítica: Priority.Critical,
      critica: Priority.Critical, // Handle without accent
    };

    const englishPriority = priorityMap[normalized];

    if (!englishPriority) {
      throw new Error(
        `Invalid priority value '${spanishPriority}' in row ${rowIndex}. Valid values are: ${PrioritySpanish.Baja}, ${PrioritySpanish.Media}, ${PrioritySpanish.Alta}, ${PrioritySpanish.Critica}`,
      );
    }

    return englishPriority;
  }

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
    const records: InsertMonthlyReport[] = data.map((row: any, index: number) => ({
      requestId: Number(row['Request ID']) || 0,
      aplicativos: String(row['Aplicativos'] || ''),
      categorizacion: String(row['Categorización'] || ''),
      createdTime: String(row['Created Time'] || ''),
      requestStatus: String(row['Request Status'] || ''),
      modulo: String(row['Modulo.'] || ''),
      subject: String(row['Subject'] || ''),
      priority: this.translatePriorityToEnglish(
        String(row['Priority'] || ''),
        index + 2, // +2 because Excel rows start at 1 and header is row 1
      ),
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
