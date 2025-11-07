import { Rep01Tag } from '../../domain/entities/rep01-tag.entity';
import { IRep01TagRepository } from '../../domain/repositories/rep01-tag.repository.interface';

export class GetAllRep01TagsUseCase {
  constructor(private readonly repository: IRep01TagRepository) {}

  async execute(): Promise<Rep01Tag[]> {
    return this.repository.findAll();
  }
}
