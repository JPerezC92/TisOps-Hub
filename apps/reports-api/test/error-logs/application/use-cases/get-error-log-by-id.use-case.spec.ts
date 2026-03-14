import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetErrorLogByIdUseCase } from '@error-logs/application/use-cases/get-error-log-by-id.use-case';
import { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';
import { ErrorLogNotFoundError } from '@error-logs/domain/errors/error-log-not-found.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ErrorLogFactory } from '../../helpers/error-log.factory';

describe('GetErrorLogByIdUseCase', () => {
  let getErrorLogByIdUseCase: GetErrorLogByIdUseCase;
  let mockRepository: MockProxy<IErrorLogRepository>;

  beforeEach(() => {
    mockRepository = mock<IErrorLogRepository>();
    getErrorLogByIdUseCase = new GetErrorLogByIdUseCase(mockRepository);
  });

  it('should return error log when found by id', async () => {
    const errorLogId = 1;
    const expectedLog = ErrorLogFactory.create({ id: errorLogId });

    mockRepository.findById.mockResolvedValue(expectedLog);

    const result = await getErrorLogByIdUseCase.execute(errorLogId);

    expect(mockRepository.findById).toHaveBeenCalledWith(errorLogId);
    expect(mockRepository.findById).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedLog);
  });

  it('should return ErrorLogNotFoundError when error log not found', async () => {
    const errorLogId = 999;

    mockRepository.findById.mockResolvedValue(null);

    const result = await getErrorLogByIdUseCase.execute(errorLogId);

    expect(DomainError.isDomainError(result)).toBe(true);
    expect(result).toBeInstanceOf(ErrorLogNotFoundError);
    expect((result as ErrorLogNotFoundError).message).toBe('Error log with ID 999 not found');
    expect(mockRepository.findById).toHaveBeenCalledWith(errorLogId);
  });

  it('should handle repository errors', async () => {
    const errorLogId = 1;
    const error = new Error('Database error');

    mockRepository.findById.mockRejectedValue(error);

    await expect(getErrorLogByIdUseCase.execute(errorLogId)).rejects.toThrow(
      'Database error',
    );
  });

  it('should return complete error log with all properties', async () => {
    const errorLog = ErrorLogFactory.create({
      id: 1,
      errorType: 'DatabaseError',
      errorMessage: 'Connection timeout',
      stackTrace: 'Error: Connection timeout\n at Database.connect',
      endpoint: '/api/users',
      method: 'POST',
      userId: 'user123',
      metadata: { query: 'SELECT *', duration: 5000 },
    });

    mockRepository.findById.mockResolvedValue(errorLog);

    const result = await getErrorLogByIdUseCase.execute(1);

    expect(result).toEqual(errorLog);
  });
});
