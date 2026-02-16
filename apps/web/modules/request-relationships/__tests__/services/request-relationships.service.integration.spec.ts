import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { requestRelationshipsService } from '@/modules/request-relationships/services/request-relationships.service';
import { RequestRelationshipsFactory } from '../helpers/request-relationships.factory';

describe('requestRelationshipsService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all relationships and unwrap JSend response', async () => {
      const mockRelationships = RequestRelationshipsFactory.createManyRequests(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { data: mockRelationships, total: 100 },
          }),
      });

      const result = await requestRelationshipsService.getAll(100, 0);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/parent-child-requests?limit=100&offset=0'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(100);
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { data: [], total: 0 },
          }),
      });

      const result = await requestRelationshipsService.getAll();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(requestRelationshipsService.getAll()).rejects.toThrow();
    });
  });

  describe('getStats', () => {
    it('should fetch stats and unwrap JSend response', async () => {
      const mockStats = RequestRelationshipsFactory.createStats({
        totalRecords: 500,
        uniqueParents: 50,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: mockStats,
          }),
      });

      const result = await requestRelationshipsService.getStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/parent-child-requests/stats'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.totalRecords).toBe(500);
      expect(result.uniqueParents).toBe(50);
      expect(result.topParents).toHaveLength(10);
    });

    it('should handle empty stats', async () => {
      const mockStats = RequestRelationshipsFactory.createStats({
        totalRecords: 0,
        uniqueParents: 0,
        topParents: [],
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: mockStats,
          }),
      });

      const result = await requestRelationshipsService.getStats();

      expect(result.totalRecords).toBe(0);
      expect(result.uniqueParents).toBe(0);
      expect(result.topParents).toHaveLength(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(requestRelationshipsService.getStats()).rejects.toThrow();
    });
  });

  describe('upload', () => {
    it('should upload file and unwrap JSend response', async () => {
      const mockResult = RequestRelationshipsFactory.createUploadResult({
        imported: 100,
        skipped: 5,
        total: 105,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: mockResult,
          }),
      });

      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await requestRelationshipsService.upload(file);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/parent-child-requests/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result.imported).toBe(100);
      expect(result.skipped).toBe(5);
      expect(result.total).toBe(105);
    });

    it('should throw error on upload failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({ message: 'Invalid file type' }),
      });

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(requestRelationshipsService.upload(file)).rejects.toThrow();
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await expect(requestRelationshipsService.upload(file)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('deleteAll', () => {
    it('should delete all relationships and unwrap JSend response', async () => {
      const mockResult = RequestRelationshipsFactory.createDeleteResult();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: mockResult,
          }),
      });

      const result = await requestRelationshipsService.deleteAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/parent-child-requests'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.deleted).toBe(true);
      expect(result.message).toBe(
        'All parent-child relationships deleted successfully'
      );
    });

    it('should throw error on delete failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(requestRelationshipsService.deleteAll()).rejects.toThrow();
    });
  });
});
