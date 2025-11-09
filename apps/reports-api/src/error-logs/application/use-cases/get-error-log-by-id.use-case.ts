import { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';

export class GetErrorLogByIdUseCase {
  constructor(private readonly errorLogRepository: IErrorLogRepository) {}

  async execute(id: number) {
    return this.errorLogRepository.findById(id);
  }
}
