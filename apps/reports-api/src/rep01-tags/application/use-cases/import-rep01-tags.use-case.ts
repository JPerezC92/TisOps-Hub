import { Rep01Tag } from '../../domain/entities/rep01-tag.entity';
import { IRep01TagRepository, Rep01TagData } from '../../domain/repositories/rep01-tag.repository.interface';

export class ImportRep01TagsUseCase {
  constructor(private readonly repository: IRep01TagRepository) {}

  async execute(data: Rep01TagData[]): Promise<{ imported: number; skipped: number }> {
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
