import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { monthlyReportService } from '@/modules/monthly-report/services/monthly-report.service';
import { createManyMonthlyReports } from '../helpers/monthly-report.factory';

describe('monthlyReportService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all monthly reports and unwrap JSend response', async () => {
      const mockReports = createManyMonthlyReports(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { data: mockReports, total: 5 },
          }),
      });

      const result = await monthlyReportService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
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

      const result = await monthlyReportService.getAll();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(monthlyReportService.getAll()).rejects.toThrow();
    });
  });

  describe('upload', () => {
    it('should upload file and unwrap JSend response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { message: 'File uploaded', imported: 47, total: 50, merged: 3, unique: 47 },
          }),
      });

      const file = new File(['content'], 'XD 2025 DATA INFORME MENSUAL.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await monthlyReportService.upload(file);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result.message).toBe('File uploaded');
      expect(result.imported).toBe(47);
      expect(result.merged).toBe(3);
    });

    it('should throw error on upload failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid file type' }),
      });

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await expect(monthlyReportService.upload(file)).rejects.toThrow();
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const file = new File(['content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await expect(monthlyReportService.upload(file)).rejects.toThrow('Network error');
    });
  });

  describe('deleteAll', () => {
    it('should delete all monthly reports and unwrap JSend response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { message: 'All deleted', deleted: 150 },
          }),
      });

      const result = await monthlyReportService.deleteAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.message).toBe('All deleted');
      expect(result.deleted).toBe(150);
    });

    it('should throw error on delete failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(monthlyReportService.deleteAll()).rejects.toThrow();
    });
  });
});
