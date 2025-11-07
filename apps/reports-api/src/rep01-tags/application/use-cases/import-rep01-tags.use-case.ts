import { Rep01Tag } from '../../domain/entities/rep01-tag.entity';
import { IRep01TagRepository, Rep01TagData } from '../../domain/repositories/rep01-tag.repository.interface';

export class ImportRep01TagsUseCase {
  constructor(private readonly repository: IRep01TagRepository) {}

  async execute(data: Rep01TagData[]): Promise<{ imported: number; skipped: number }> {
    if (data.length === 0) {
      return { imported: 0, skipped: 0 };
    }

    // Import with batch processing and duplicate handling
    // The repository will handle batch insertion and skip duplicates automatically
    const imported = await this.repository.createMany(data);
    const skipped = data.length - imported;

    return { imported, skipped };
  }
}
