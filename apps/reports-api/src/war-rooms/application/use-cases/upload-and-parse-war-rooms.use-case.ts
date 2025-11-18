import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import type { InsertWarRoom } from '@repo/database';

export class UploadAndParseWarRoomsUseCase {
  constructor(private readonly repository: IWarRoomsRepository) {}

  async execute(records: InsertWarRoom[]): Promise<{
    message: string;
    imported: number;
    total: number;
  }> {
    // Validate required fields - BUSINESS LOGIC
    const invalidRecords = records.filter(
      (record) => !record.incidentId || !record.application,
    );

    if (invalidRecords.length > 0) {
      throw new Error(
        'Some records are missing required fields (Incident ID, Application)',
      );
    }

    // Remove duplicates by incidentId - BUSINESS LOGIC
    const uniqueRecords = [];
    const seenIds = new Set();
    for (const record of records) {
      if (!seenIds.has(record.incidentId)) {
        seenIds.add(record.incidentId);
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
