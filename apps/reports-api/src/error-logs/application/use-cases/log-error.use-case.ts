import { ErrorLog } from '../../domain/entities/error-log.entity';
import { IErrorLogRepository } from '../../domain/repositories/error-log.repository.interface';

export interface LogErrorData {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class LogErrorUseCase {
  constructor(private readonly errorLogRepository: IErrorLogRepository) {}

  async execute(data: LogErrorData): Promise<ErrorLog> {
    const errorLog = new ErrorLog({
      timestamp: new Date(),
      errorType: data.errorType,
      errorMessage: data.errorMessage,
      stackTrace: data.stackTrace,
      endpoint: data.endpoint,
      method: data.method,
      userId: data.userId,
      metadata: data.metadata,
    });

    return this.errorLogRepository.create(errorLog);
  }
}
