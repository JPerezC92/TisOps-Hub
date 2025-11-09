import { ErrorLog } from '@error-logs/domain/entities/error-log.entity';

export const ERROR_LOG_REPOSITORY = Symbol('ERROR_LOG_REPOSITORY');

export interface IErrorLogRepository {
  create(errorLog: Omit<ErrorLog, 'id'>): Promise<ErrorLog>;
  findAll(limit?: number): Promise<ErrorLog[]>;
  findById(id: number): Promise<ErrorLog | null>;
}
