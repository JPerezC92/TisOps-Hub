import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import { ErrorLogsController } from './error-logs.controller';
import { ErrorLogRepository } from './infrastructure/repositories/error-log.repository';
import { LogErrorUseCase } from './application/use-cases/log-error.use-case';
import { GetAllErrorLogsUseCase } from './application/use-cases/get-all-error-logs.use-case';
import { GetErrorLogByIdUseCase } from './application/use-cases/get-error-log-by-id.use-case';
import { DatabaseExceptionFilter } from './infrastructure/filters/database-exception.filter';
import { ERROR_LOG_REPOSITORY } from './domain/repositories/error-log.repository.interface';

@Module({
  controllers: [ErrorLogsController],
  providers: [
    // Repository
    {
      provide: ERROR_LOG_REPOSITORY,
      useFactory: (db) => new ErrorLogRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    // Use Cases
    {
      provide: LogErrorUseCase,
      useFactory: (errorLogRepository) => new LogErrorUseCase(errorLogRepository),
      inject: [ERROR_LOG_REPOSITORY],
    },
    {
      provide: GetAllErrorLogsUseCase,
      useFactory: (errorLogRepository) => new GetAllErrorLogsUseCase(errorLogRepository),
      inject: [ERROR_LOG_REPOSITORY],
    },
    {
      provide: GetErrorLogByIdUseCase,
      useFactory: (errorLogRepository) => new GetErrorLogByIdUseCase(errorLogRepository),
      inject: [ERROR_LOG_REPOSITORY],
    },
    // Exception Filter
    {
      provide: DatabaseExceptionFilter,
      useFactory: (logErrorUseCase) => new DatabaseExceptionFilter(logErrorUseCase),
      inject: [LogErrorUseCase],
    },
  ],
  exports: [DatabaseExceptionFilter],
})
export class ErrorLogsModule {}
