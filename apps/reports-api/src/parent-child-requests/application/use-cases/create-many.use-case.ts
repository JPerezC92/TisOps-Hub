import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';

export class CreateManyParentChildRequestsUseCase {
  constructor(
    private readonly repository: IParentChildRequestRepository,
  ) {}

  /**
   * Creates multiple parent-child request relationships from parsed data.
   * 
   * ⚠️ WARNING: This operation drops and recreates the entire table,
   * removing all existing data before importing new records.
   * 
   * @param data - Array of parent-child relationships to create (including optional hyperlinks)
   * @returns Statistics about the operation (imported and skipped counts)
   */
  async execute(data: Array<{ 
    requestId: string; 
    linkedRequestId: string;
    requestIdLink?: string;
    linkedRequestIdLink?: string;
  }>): Promise<{
    imported: number;
    skipped: number;
  }> {
    let imported = 0;
    let skipped = 0;

    // Drop and recreate the table to ensure clean import
    await this.repository.dropAndRecreateTable();

    // Batch insert for better performance
    const batchSize = 500;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      try {
        await this.repository.bulkCreate(batch);
        imported += batch.length;
      } catch (error) {
        // If batch insert fails due to duplicates, try one by one
        for (const record of batch) {
          try {
            await this.repository.createOne(record);
            imported++;
          } catch (err) {
            skipped++;
          }
        }
      }
    }

    return { imported, skipped };
  }
}
