import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import type { InsertSessionsOrder, InsertSessionsOrdersRelease } from '@repo/database';

export class UploadAndParseSessionsOrdersUseCase {
  constructor(private readonly repository: ISessionsOrdersRepository) {}

  async execute(
    mainRecords: InsertSessionsOrder[],
    releaseRecords: InsertSessionsOrdersRelease[],
  ): Promise<{
    message: string;
    importedMain: number;
    importedReleases: number;
    totalMain: number;
    totalReleases: number;
  }> {
    // Delete existing records
    await Promise.all([
      this.repository.deleteAllMain(),
      this.repository.deleteAllReleases(),
    ]);

    // Bulk insert
    await Promise.all([
      this.repository.bulkCreateMain(mainRecords),
      this.repository.bulkCreateReleases(releaseRecords),
    ]);

    return {
      message: 'File uploaded and parsed successfully',
      importedMain: mainRecords.length,
      importedReleases: releaseRecords.length,
      totalMain: mainRecords.length,
      totalReleases: releaseRecords.length,
    };
  }
}
