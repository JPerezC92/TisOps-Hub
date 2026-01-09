import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorLogsService } from '../../services/error-logs.service';
import { ErrorLogFactory } from '../helpers/error-log.factory';

describe('errorLogsService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch error logs with default limit and unwrap JSend response', async () => {
      const mockErrorLogs = ErrorLogFactory.createMany(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: {
              logs: mockErrorLogs,
              total: mockErrorLogs.length,
            },
          }),
      });

      const result = await errorLogsService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/error-logs?limit=50'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.logs).toHaveLength(5);
      expect(result.total).toBe(5);
    });

    it('should fetch error logs with custom limit', async () => {
      const mockErrorLogs = ErrorLogFactory.createMany(25);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: {
              logs: mockErrorLogs,
              total: mockErrorLogs.length,
            },
          }),
      });

      const result = await errorLogsService.getAll(25);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/error-logs?limit=25'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.logs).toHaveLength(25);
      expect(result.total).toBe(25);
    });

    it('should return error log with all fields', async () => {
      const mockErrorLog = ErrorLogFactory.create({
        id: 1,
        errorType: 'DatabaseError',
        errorMessage: 'Connection failed',
        method: 'GET',
        endpoint: '/api/users',
        stackTrace: 'Error at line 10',
        metadata: { ip: '127.0.0.1' },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: {
              logs: [mockErrorLog],
              total: 1,
            },
          }),
      });

      const result = await errorLogsService.getAll();

      expect(result.logs[0]).toMatchObject({
        id: 1,
        errorType: 'DatabaseError',
        errorMessage: 'Connection failed',
        method: 'GET',
        endpoint: '/api/users',
        stackTrace: 'Error at line 10',
      });
      expect(result.logs[0]?.metadata).toEqual({ ip: '127.0.0.1' });
    });

    it('should throw on server error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            status: 'error',
            message: 'Internal server error',
          }),
      });

      await expect(errorLogsService.getAll()).rejects.toThrow();
    });

    it('should throw on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(errorLogsService.getAll()).rejects.toThrow('Network error');
    });
  });
});
