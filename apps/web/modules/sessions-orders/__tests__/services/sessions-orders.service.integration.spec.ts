import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { sessionsOrdersService } from '@/modules/sessions-orders/services/sessions-orders.service';
import { createManySessionsOrders, createManyReleases } from '../helpers/sessions-orders.factory';

describe('sessionsOrdersService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all sessions orders and unwrap JSend response', async () => {
      const mockData = createManySessionsOrders(5);
      const mockReleases = createManyReleases(3);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { data: mockData, releases: mockReleases, total: 5, totalReleases: 3 },
          }),
      });

      const result = await sessionsOrdersService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions-orders'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.data).toHaveLength(5);
      expect(result.releases).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.totalReleases).toBe(3);
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { data: [], releases: [], total: 0, totalReleases: 0 },
          }),
      });

      const result = await sessionsOrdersService.getAll();

      expect(result.data).toHaveLength(0);
      expect(result.releases).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(sessionsOrdersService.getAll()).rejects.toThrow();
    });
  });

  describe('upload', () => {
    it('should upload file and unwrap JSend response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { message: 'File uploaded', importedMain: 100, importedReleases: 10, totalMain: 100, totalReleases: 10 },
          }),
      });

      const file = new File(['content'], 'SB INCIDENTES ORDENES SESIONES.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await sessionsOrdersService.upload(file);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions-orders/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result.message).toBe('File uploaded');
      expect(result.importedMain).toBe(100);
      expect(result.importedReleases).toBe(10);
    });

    it('should throw error on upload failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid file type' }),
      });

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await expect(sessionsOrdersService.upload(file)).rejects.toThrow();
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const file = new File(['content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await expect(sessionsOrdersService.upload(file)).rejects.toThrow('Network error');
    });
  });

  describe('deleteAll', () => {
    it('should delete all and unwrap JSend response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { message: 'All deleted', deletedMain: 100, deletedReleases: 10 },
          }),
      });

      const result = await sessionsOrdersService.deleteAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions-orders'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.message).toBe('All deleted');
      expect(result.deletedMain).toBe(100);
      expect(result.deletedReleases).toBe(10);
    });

    it('should throw error on delete failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(sessionsOrdersService.deleteAll()).rejects.toThrow();
    });
  });
});
