import { IErrorLogRepository } from '../../domain/repositories/error-log.repository.interface';

export class GetAllErrorLogsUseCase {
  constructor(private readonly errorLogRepository: IErrorLogRepository) {}

  async execute(limit?: number) {
    return this.errorLogRepository.findAll(limit);
  }
}
