import { Rep01Tag } from '../../domain/entities/rep01-tag.entity';
import { IRep01TagRepository, Rep01TagData } from '../../domain/repositories/rep01-tag.repository.interface';

export class CreateRep01TagUseCase {
  constructor(private readonly repository: IRep01TagRepository) {}

  async execute(data: Rep01TagData): Promise<Rep01Tag> {
    // Check if request already exists
    const existing = await this.repository.findByRequestId(data.requestId);
    if (existing) {
      throw new Error(`Request ID ${data.requestId} already exists`);
    }

    return this.repository.create(data);
  }
}
