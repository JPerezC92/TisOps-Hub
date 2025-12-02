import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { DateTime } from 'luxon';
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

  /**
   * Parse date string from Excel format to Date object
   * Format: "dd/MM/yyyy HH:mm" (e.g., "06/11/2025 13:38")
   */
  private parseCreatedTime(dateString: string, rowIndex: number): Date {
    if (!dateString || dateString.trim() === '') {
      throw new Error(`Empty Created Time in row ${rowIndex}`);
    }

    const parsed = DateTime.fromFormat(dateString.trim(), 'dd/MM/yyyy HH:mm');

    if (!parsed.isValid) {
      throw new Error(
        `Invalid date format '${dateString}' in row ${rowIndex}. Expected format: dd/MM/yyyy HH:mm`,
      );
    }

    return parsed.toJSDate();
  }

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

  parse(buffer: Buffer): InsertMonthlyReport[] {
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
    const records: InsertMonthlyReport[] = data.map((row: any, index: number) => {
      // Row index in Excel is index + 2 (header row + 0-based index)
      const excelRowNum = index + 2;

      // Find hyperlinks for Request ID and Linked Request Id
      let requestIdLink: string | undefined;
      let linkedRequestIdLink: string | undefined;

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
          } else if (headerValue === 'Linked Request Id') {
            linkedRequestIdLink = this.decodeHtmlEntities(cell.l.Target);
          }
        }
      }

      return {
        requestId: Number(row['Request ID']) || 0,
        requestIdLink,
        aplicativos: String(row['Aplicativos'] || ''),
        categorizacion: String(row['Categorización'] || ''),
        createdTime: this.parseCreatedTime(String(row['Created Time'] || ''), excelRowNum),
        requestStatus: String(row['Request Status'] || '').replace(/\s+/g, ' ').trim(),
        modulo: String(row['Modulo.'] || ''),
        subject: String(row['Subject'] || ''),
        priority: this.translatePriorityToEnglish(
          String(row['Priority'] || ''),
          excelRowNum,
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
        linkedRequestIdLink,
        requestOlaStatus: String(row['Request OLA Status'] || ''),
        grupoEscalamiento: String(row['Grupo Escalamiento'] || ''),
        aplicactivosAfectados: String(row['Aplicactivos Afectados'] || ''),
        nivelUno: String(row['¿Este Incidente se debió Resolver en Nivel 1?'] || ''),
        campana: String(row['Campaña'] || ''),
        cuv: String(row['CUV_1'] || ''),
        release: String(row['Release'] || ''),
        rca: String(row['RCA'] || ''),
      };
    });

    return records;
  }
}
