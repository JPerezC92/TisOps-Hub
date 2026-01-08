import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { RequestTagFactory } from '../helpers/request-tag.factory';

describe('requestTagsService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all request tags and unwrap JSend response', async () => {
      const mockTags = RequestTagFactory.createMany(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: { tags: mockTags, total: mockTags.length },
        }),
      });

      const result = await requestTagsService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/request-tags'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.tags).toHaveLength(5);
      expect(result.total).toBe(5);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(requestTagsService.getAll()).rejects.toThrow();
    });
  });

  describe('upload', () => {
    it('should upload file and unwrap JSend response', async () => {
      const importedCount = faker.number.int({ min: 50, max: 200 });
      const skippedCount = faker.number.int({ min: 0, max: 20 });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: {
            imported: importedCount,
            skipped: skippedCount,
            total: importedCount + skippedCount,
          },
        }),
      });

      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await requestTagsService.upload(file);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/request-tags/upload'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.imported).toBe(importedCount);
      expect(result.skipped).toBe(skippedCount);
    });

    it('should send FormData with file', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: { imported: 1, skipped: 0, total: 1 },
        }),
      });

      const file = new File(['content'], 'report.xlsx');
      await requestTagsService.upload(file);

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs?.[1]?.body as FormData;
      expect(body.get('file')).toBe(file);
    });

    it('should throw on upload error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ data: { message: 'Invalid file type' } }),
      });

      const file = new File(['test'], 'test.pdf');

      await expect(requestTagsService.upload(file)).rejects.toThrow('Invalid file type');
    });
  });

  describe('deleteAll', () => {
    it('should delete all request tags and unwrap JSend response', async () => {
      const deletedCount = faker.number.int({ min: 10, max: 100 });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: { deleted: deletedCount },
        }),
      });

      const result = await requestTagsService.deleteAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/request-tags'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.deleted).toBe(deletedCount);
    });

    it('should throw on delete error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(requestTagsService.deleteAll()).rejects.toThrow();
    });
  });
});
