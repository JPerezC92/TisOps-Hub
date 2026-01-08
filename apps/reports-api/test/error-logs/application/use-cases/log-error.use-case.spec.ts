import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { LogErrorUseCase, LogErrorData } from '@error-logs/application/use-cases/log-error.use-case';
import { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';
import { ErrorLogFactory } from '../../helpers/error-log.factory';

describe('LogErrorUseCase', () => {
  let logErrorUseCase: LogErrorUseCase;
  let mockRepository: MockProxy<IErrorLogRepository>;

  beforeEach(() => {
    mockRepository = mock<IErrorLogRepository>();
    logErrorUseCase = new LogErrorUseCase(mockRepository);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create error log with all fields', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    vi.setSystemTime(now);

    const logData: LogErrorData = {
      errorType: 'DatabaseError',
      errorMessage: 'Connection timeout',
      stackTrace: 'Error: Connection timeout\n at Database.connect',
      endpoint: '/api/users',
      method: 'POST',
      userId: 'user123',
      metadata: { query: 'SELECT *', duration: 5000 },
    };

    const createdLog = ErrorLogFactory.create({
      id: 1,
      timestamp: now,
      ...logData,
    });

    mockRepository.create.mockResolvedValue(createdLog);

    const result = await logErrorUseCase.execute(logData);

    expect(mockRepository.create).toHaveBeenCalledOnce();
    const createCall = mockRepository.create.mock.calls[0][0];
    expect(createCall.timestamp).toEqual(now);
    expect(createCall.errorType).toBe('DatabaseError');
    expect(createCall.errorMessage).toBe('Connection timeout');
    expect(result).toEqual(createdLog);
  });

  it('should create error log with only required fields', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    vi.setSystemTime(now);

    const logData: LogErrorData = {
      errorType: 'TypeError',
      errorMessage: 'Cannot read property',
    };

    const createdLog = ErrorLogFactory.create({
      id: 1,
      timestamp: now,
      errorType: 'TypeError',
      errorMessage: 'Cannot read property',
    });

    mockRepository.create.mockResolvedValue(createdLog);

    const result = await logErrorUseCase.execute(logData);

    expect(mockRepository.create).toHaveBeenCalledOnce();
    const createCall = mockRepository.create.mock.calls[0][0];
    expect(createCall.timestamp).toEqual(now);
    expect(createCall.stackTrace).toBeUndefined();
    expect(createCall.endpoint).toBeUndefined();
    expect(result.errorType).toBe('TypeError');
  });

  it('should handle repository errors', async () => {
    const logData: LogErrorData = {
      errorType: 'ValidationError',
      errorMessage: 'Invalid input',
    };

    const error = new Error('Database error');
    mockRepository.create.mockRejectedValue(error);

    await expect(logErrorUseCase.execute(logData)).rejects.toThrow(
      'Database error',
    );
  });

  it('should create error log with metadata', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    vi.setSystemTime(now);

    const logData: LogErrorData = {
      errorType: 'NetworkError',
      errorMessage: 'Request failed',
      metadata: {
        url: 'https://api.example.com',
        statusCode: 500,
        retries: 3,
      },
    };

    const createdLog = ErrorLogFactory.create({
      id: 1,
      timestamp: now,
      ...logData,
    });

    mockRepository.create.mockResolvedValue(createdLog);

    const result = await logErrorUseCase.execute(logData);

    const createCall = mockRepository.create.mock.calls[0][0];
    expect(createCall.metadata).toEqual({
      url: 'https://api.example.com',
      statusCode: 500,
      retries: 3,
    });
    expect(result).toEqual(createdLog);
  });

  it('should set current timestamp when creating error log', async () => {
    const now = new Date('2024-01-15T12:30:00Z');
    vi.setSystemTime(now);

    const logData: LogErrorData = {
      errorType: 'Error',
      errorMessage: 'Something went wrong',
    };

    const createdLog = ErrorLogFactory.create({
      id: 1,
      timestamp: now,
      ...logData,
    });

    mockRepository.create.mockResolvedValue(createdLog);

    await logErrorUseCase.execute(logData);

    const createCall = mockRepository.create.mock.calls[0][0];
    expect(createCall.timestamp).toEqual(now);
  });

  it('should create error log with endpoint and method', async () => {
    const logData: LogErrorData = {
      errorType: 'AuthError',
      errorMessage: 'Unauthorized',
      endpoint: '/api/auth/login',
      method: 'POST',
      userId: 'user456',
    };

    const createdLog = ErrorLogFactory.create({
      id: 1,
      ...logData,
    });

    mockRepository.create.mockResolvedValue(createdLog);

    const result = await logErrorUseCase.execute(logData);

    const createCall = mockRepository.create.mock.calls[0][0];
    expect(createCall.endpoint).toBe('/api/auth/login');
    expect(createCall.method).toBe('POST');
    expect(createCall.userId).toBe('user456');
    expect(result.endpoint).toBe('/api/auth/login');
  });
});
