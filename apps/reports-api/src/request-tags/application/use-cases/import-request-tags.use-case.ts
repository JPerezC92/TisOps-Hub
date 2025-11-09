import { RequestTag } from '@request-tags/domain/entities/request-tag.entity';
import { IRequestTagRepository, RequestTagData } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class ImportRequestTagsUseCase {
  constructor(private readonly repository: IRequestTagRepository) {}

  async execute(data: RequestTagData[]): Promise<{ imported: number; skipped: number }> {
    if (data.length === 0) {
      return { imported: 0, skipped: 0 };
    }

    // Delete all existing records before importing new data
    await this.repository.deleteAll();

    // Import with batch processing
    // Since we cleared the table, there should be no duplicates
    const imported = await this.repository.createMany(data);
    const skipped = data.length - imported;

    return { imported, skipped };
  }
}
