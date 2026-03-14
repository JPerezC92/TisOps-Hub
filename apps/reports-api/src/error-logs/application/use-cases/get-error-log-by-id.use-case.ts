import { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';
import { ErrorLog } from '@error-logs/domain/entities/error-log.entity';
import { ErrorLogNotFoundError } from '@error-logs/domain/errors/error-log-not-found.error';

export class GetErrorLogByIdUseCase {
  constructor(private readonly errorLogRepository: IErrorLogRepository) {}

  async execute(id: number): Promise<ErrorLog | ErrorLogNotFoundError> {
    const errorLog = await this.errorLogRepository.findById(id);
    if (!errorLog) {
      return new ErrorLogNotFoundError(id);
    }
    return errorLog;
  }
}
