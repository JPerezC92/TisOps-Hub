import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetErrorLogByIdUseCase } from '@error-logs/application/use-cases/get-error-log-by-id.use-case';
import { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';
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
    expect(result?.id).toBe(errorLogId);
  });

  it('should return null when error log not found', async () => {
    const errorLogId = 999;

    mockRepository.findById.mockResolvedValue(null);

    const result = await getErrorLogByIdUseCase.execute(errorLogId);

    expect(mockRepository.findById).toHaveBeenCalledWith(errorLogId);
    expect(result).toBeNull();
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
    expect(result?.errorType).toBe('DatabaseError');
    expect(result?.stackTrace).toBeDefined();
    expect(result?.metadata).toBeDefined();
  });
});
