import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { problemsService } from '@/modules/problems/services/problems.service';
import { ProblemFactory } from '../helpers/problem.factory';

describe('problemsService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all problems and unwrap JSend response', async () => {
      const mockProblems = ProblemFactory.createManyProblems(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { data: mockProblems, total: 5 },
          }),
      });

      const result = await problemsService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/problems'),
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

      const result = await problemsService.getAll();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(problemsService.getAll()).rejects.toThrow();
    });
  });

  describe('upload', () => {
    it('should upload file and unwrap JSend response', async () => {
      const mockResult = ProblemFactory.createUploadResult({
        imported: 50,
        total: 55,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: mockResult,
          }),
      });

      const file = new File(['test'], 'XD PROBLEMAS NUEVOS.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await problemsService.upload(file);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/problems/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result.imported).toBe(50);
      expect(result.total).toBe(55);
      expect(result.message).toBe('File processed successfully');
    });

    it('should throw error on upload failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid file type' }),
      });

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(problemsService.upload(file)).rejects.toThrow();
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await expect(problemsService.upload(file)).rejects.toThrow('Network error');
    });
  });

  describe('deleteAll', () => {
    it('should delete all problems and unwrap JSend response', async () => {
      const mockResult = ProblemFactory.createDeleteResult({
        deleted: 100,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: mockResult,
          }),
      });

      const result = await problemsService.deleteAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/problems'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.deleted).toBe(100);
      expect(result.message).toBe('All problems deleted successfully');
    });

    it('should throw error on delete failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(problemsService.deleteAll()).rejects.toThrow();
    });
  });
});
