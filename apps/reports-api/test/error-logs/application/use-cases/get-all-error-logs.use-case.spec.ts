import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllErrorLogsUseCase } from '@error-logs/application/use-cases/get-all-error-logs.use-case';
import { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';
import { ErrorLogFactory } from '../../helpers/error-log.factory';

describe('GetAllErrorLogsUseCase', () => {
  let getAllErrorLogsUseCase: GetAllErrorLogsUseCase;
  let mockRepository: MockProxy<IErrorLogRepository>;

  beforeEach(() => {
    mockRepository = mock<IErrorLogRepository>();
    getAllErrorLogsUseCase = new GetAllErrorLogsUseCase(mockRepository);
  });

  it('should return all error logs without limit', async () => {
    const expectedLogs = ErrorLogFactory.createMany(5);

    mockRepository.findAll.mockResolvedValue(expectedLogs);

    const result = await getAllErrorLogsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedLogs);
    expect(result).toHaveLength(5);
  });

  it('should return error logs with specified limit', async () => {
    const expectedLogs = ErrorLogFactory.createMany(10);

    mockRepository.findAll.mockResolvedValue(expectedLogs);

    const result = await getAllErrorLogsUseCase.execute(10);

    expect(mockRepository.findAll).toHaveBeenCalledWith(10);
    expect(result).toHaveLength(10);
  });

  it('should return empty array when no error logs exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await getAllErrorLogsUseCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(getAllErrorLogsUseCase.execute()).rejects.toThrow(
      'Database error',
    );
  });

  it('should return logs with different error types', async () => {
    const logs = [
      ErrorLogFactory.create({ errorType: 'TypeError' }),
      ErrorLogFactory.create({ errorType: 'DatabaseError' }),
      ErrorLogFactory.create({ errorType: 'ValidationError' }),
    ];

    mockRepository.findAll.mockResolvedValue(logs);

    const result = await getAllErrorLogsUseCase.execute();

    expect(result).toHaveLength(3);
    expect(result[0].errorType).toBe('TypeError');
    expect(result[1].errorType).toBe('DatabaseError');
    expect(result[2].errorType).toBe('ValidationError');
  });
});
