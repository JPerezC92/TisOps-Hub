import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import type { InsertMonthlyReport } from '@repo/database';

export class UploadAndParseMonthlyReportUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  private isEmptyValue(value: string | null | undefined): boolean {
    const emptyValues = ['No asignado', 'No Validado', '', null, undefined];
    return emptyValues.includes(value) || (typeof value === 'string' && value.trim() === '');
  }

  private mergeRecords(existing: InsertMonthlyReport, incoming: InsertMonthlyReport): InsertMonthlyReport {
    const merged = { ...existing };

    // For each field in incoming, use it if existing field is empty
    for (const key in incoming) {
      if (key === 'requestId') continue; // Skip primary key

      const existingValue = existing[key as keyof InsertMonthlyReport];
      const incomingValue = incoming[key as keyof InsertMonthlyReport];

      if (this.isEmptyValue(existingValue as string) && !this.isEmptyValue(incomingValue as string)) {
        (merged as any)[key] = incomingValue;
      }
    }

    return merged;
  }

  async execute(allRecords: InsertMonthlyReport[]): Promise<{
    message: string;
    imported: number;
    total: number;
    merged: number;
    unique: number;
  }> {
    // Merge duplicates by requestId (keep non-empty values) - BUSINESS LOGIC
    const requestIdMap = new Map<number, InsertMonthlyReport>();
    let duplicateCount = 0;

    for (const record of allRecords) {
      if (requestIdMap.has(record.requestId)) {
        const existing = requestIdMap.get(record.requestId)!;
        const merged = this.mergeRecords(existing, record);
        requestIdMap.set(record.requestId, merged);
        duplicateCount++;
      } else {
        requestIdMap.set(record.requestId, record);
      }
    }

    const records = Array.from(requestIdMap.values());

    // Validate required fields - BUSINESS LOGIC
    const invalidRecords = records.filter(
      (record) => !record.requestId || !record.aplicativos,
    );

    if (invalidRecords.length > 0) {
      throw new Error(
        'Some records are missing required fields (Request ID, Aplicativos)',
      );
    }

    // Delete existing records
    await this.repository.deleteAll();

    // Bulk insert
    await this.repository.bulkCreate(records);

    return {
      message: 'File uploaded and parsed successfully',
      imported: records.length,
      total: allRecords.length,
      merged: duplicateCount,
      unique: records.length,
    };
  }
}
