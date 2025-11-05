import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

export interface ParsedParentChildData {
  requestId: string;
  linkedRequestId: string;
  requestIdLink?: string;
  linkedRequestIdLink?: string;
}

@Injectable()
export class ExcelParserService {
  /**
   * Parse Excel file buffer and extract parent-child request relationships
   * with optional hyperlinks
   * 
   * @param buffer - Excel file buffer
   * @returns Array of parsed parent-child relationships
   * @throws BadRequestException if file format is invalid or no data found
   */
  parseExcelFile(buffer: Buffer): ParsedParentChildData[] {
    try {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new BadRequestException('No sheets found in Excel file');
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      if (rawData.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      // Get the range to find column positions
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

      // Transform data with hyperlink extraction
      const data = rawData
        .map((row: any, rowIndex: number) => {
          // Row index in Excel is rowIndex + 2 (header row + 0-based index)
          const excelRowNum = rowIndex + 2;

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
              const header = worksheet[
                XLSX.utils.encode_cell({ r: 0, c: col })
              ];
              const headerValue = header?.v || header?.w || '';

              if (headerValue === 'Request ID') {
                // Decode HTML entities (e.g., &amp; -> &)
                requestIdLink = this.decodeHtmlEntities(cell.l.Target);
              } else if (headerValue === 'Linked Request Id') {
                // Decode HTML entities (e.g., &amp; -> &)
                linkedRequestIdLink = this.decodeHtmlEntities(cell.l.Target);
              }
            }
          }

          return {
            requestId: String(row['Request ID'] || ''),
            linkedRequestId: String(row['Linked Request Id'] || ''),
            requestIdLink,
            linkedRequestIdLink,
          };
        })
        .filter((item) => item.requestId && item.linkedRequestId);

      if (data.length === 0) {
        throw new BadRequestException(
          'No valid data found in file. Expected columns: "Request ID" and "Linked Request Id"',
        );
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to parse Excel file: ${(error as Error).message}`,
      );
    }
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
}
