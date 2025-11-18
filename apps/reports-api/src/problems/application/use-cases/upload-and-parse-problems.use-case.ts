import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';
import type { InsertProblem } from '@repo/database';

export class UploadAndParseProblemsUseCase {
  constructor(private readonly repository: IProblemsRepository) {}

  async execute(records: InsertProblem[]): Promise<{
    message: string;
    imported: number;
    total: number;
  }> {
    // Validate required fields - BUSINESS LOGIC
    const invalidRecords = records.filter(
      (record) => !record.requestId || !record.aplicativos,
    );

    if (invalidRecords.length > 0) {
      throw new Error(
        'Some records are missing required fields (Request ID, Aplicativos)',
      );
    }

    // Remove duplicates by requestId - BUSINESS LOGIC
    const uniqueRecords = [];
    const seenIds = new Set();
    for (const record of records) {
      if (!seenIds.has(record.requestId)) {
        seenIds.add(record.requestId);
        uniqueRecords.push(record);
      }
    }

    // Delete existing records
    await this.repository.deleteAll();

    // Bulk insert
    await this.repository.bulkCreate(uniqueRecords);

    return {
      message: 'File uploaded and parsed successfully',
      imported: uniqueRecords.length,
      total: records.length,
    };
  }
}
