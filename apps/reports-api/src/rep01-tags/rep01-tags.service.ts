import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { GetAllRep01TagsUseCase } from './application/use-cases/get-all-rep01-tags.use-case';
import { DeleteAllRep01TagsUseCase } from './application/use-cases/delete-all-rep01-tags.use-case';
import { ImportRep01TagsUseCase } from './application/use-cases/import-rep01-tags.use-case';

@Injectable()
export class Rep01TagsService {
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
  constructor(
    private readonly getAllRep01TagsUseCase: GetAllRep01TagsUseCase,
    private readonly deleteAllRep01TagsUseCase: DeleteAllRep01TagsUseCase,
    private readonly importRep01TagsUseCase: ImportRep01TagsUseCase,
  ) {}

  async findAll() {
    const tags = await this.getAllRep01TagsUseCase.execute();
    return {
      data: tags,
      total: tags.length,
    };
  }

  async deleteAll() {
    const result = await this.deleteAllRep01TagsUseCase.execute();
    return {
      message: 'All records deleted successfully',
      deleted: result.deleted,
    };
  }

  async uploadAndParse(buffer: Buffer) {
    try {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new HttpException('Excel file is empty', HttpStatus.BAD_REQUEST);
      }

      // Map Excel rows to domain format with hyperlink extraction
      const records = data.map((row: any, index: number) => {
        const rowIndex = index + 1; // +1 because row 0 is header

        // Extract hyperlinks from specific columns:
        // Column C (index 2) = Información Adicional (contains Request ID link)
        // Column F (index 5) = Linked Request Id (contains Linked Request link)
        const requestIdLink = this.extractHyperlink(worksheet, rowIndex, 2);
        const linkedRequestIdLink = this.extractHyperlink(worksheet, rowIndex, 5);

        return {
          createdTime: String(row['Created Time'] || ''),
          requestId: String(row['Request ID'] || ''),
          requestIdLink: requestIdLink || undefined,
          informacionAdicional: String(row['Información Adicional'] || ''),
          modulo: String(row['Modulo.'] || ''),
          problemId: String(row['Problem ID'] || ''),
          linkedRequestId: String(row['Linked Request Id'] || ''),
          linkedRequestIdLink: linkedRequestIdLink || undefined,
          jira: String(row['Jira'] || ''),
          categorizacion: String(row['Categorización'] || ''),
          technician: String(row['Technician'] || ''),
        };
      });

      // Validate required fields
      const invalidRecords = records.filter(
        (record) => !record.requestId || !record.createdTime,
      );

      if (invalidRecords.length > 0) {
        throw new HttpException(
          'Some records are missing required fields (Request ID, Created Time)',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Import using use case
      const result = await this.importRep01TagsUseCase.execute(records);

      return {
        message: 'File uploaded and parsed successfully',
        imported: result.imported,
        skipped: result.skipped,
        total: records.length,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to parse file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
