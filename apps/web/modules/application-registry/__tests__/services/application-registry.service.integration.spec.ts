import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { applicationRegistryService } from '@/modules/application-registry/services/application-registry.service';
import { ApplicationFactory } from '../helpers/application.factory';

describe('applicationRegistryService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAllWithPatterns', () => {
    it('should fetch all applications with patterns and unwrap JSend response', async () => {
      const mockApps = [
        ApplicationFactory.createWithPatterns(2),
        ApplicationFactory.createWithPatterns(3),
        ApplicationFactory.create({ patterns: [] }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockApps,
        }),
      });

      const result = await applicationRegistryService.getAllWithPatterns();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/application-registry/with-patterns'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result).toHaveLength(3);
      expect(result[0]!.patterns).toHaveLength(2);
      expect(result[1]!.patterns).toHaveLength(3);
      expect(result[2]!.patterns).toHaveLength(0);
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: [],
        }),
      });

      const result = await applicationRegistryService.getAllWithPatterns();

      expect(result).toHaveLength(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(applicationRegistryService.getAllWithPatterns()).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create application and unwrap JSend response', async () => {
      const createData = { code: 'NEW', name: 'New Application', description: 'Test desc' };
      const mockCreated = ApplicationFactory.createApplication({
        ...createData,
        id: 1,
        isActive: true,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockCreated,
        }),
      });

      const result = await applicationRegistryService.create(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/application-registry'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.code).toBe('NEW');
      expect(result.name).toBe('New Application');
    });

    it('should send isActive: true by default', async () => {
      const createData = { code: 'TEST', name: 'Test App' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: ApplicationFactory.createApplication(createData),
        }),
      });

      await applicationRegistryService.create(createData);

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs?.[1]?.body as string);
      expect(body.isActive).toBe(true);
    });

    it('should throw on create error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ data: { message: 'Validation error' } }),
      });

      await expect(
        applicationRegistryService.create({ code: '', name: '' })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update application and unwrap JSend response', async () => {
      const updateData = { name: 'Updated App' };
      const mockUpdated = ApplicationFactory.createApplication({
        id: 1,
        ...updateData,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockUpdated,
        }),
      });

      const result = await applicationRegistryService.update(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/application-registry/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.name).toBe('Updated App');
    });

    it('should throw on update error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Update failed' }),
      });

      await expect(
        applicationRegistryService.update(1, { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete application and unwrap JSend response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: { message: 'Application deleted' },
        }),
      });

      const result = await applicationRegistryService.delete(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/application-registry/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.message).toBe('Application deleted');
    });

    it('should throw on delete error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(applicationRegistryService.delete(1)).rejects.toThrow();
    });
  });

  describe('createPattern', () => {
    it('should create pattern and unwrap JSend response', async () => {
      const patternData = { pattern: 'Somos Belcorp', priority: 10 };
      const mockPattern = ApplicationFactory.createPattern({
        ...patternData,
        applicationId: 5,
        matchType: 'contains',
        isActive: true,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockPattern,
        }),
      });

      const result = await applicationRegistryService.createPattern(5, patternData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/application-registry/5/patterns'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.pattern).toBe('Somos Belcorp');
      expect(result.priority).toBe(10);
    });

    it('should send matchType and isActive defaults', async () => {
      const patternData = { pattern: 'Test', priority: 50 };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: ApplicationFactory.createPattern(patternData),
        }),
      });

      await applicationRegistryService.createPattern(1, patternData);

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs?.[1]?.body as string);
      expect(body.matchType).toBe('contains');
      expect(body.isActive).toBe(true);
    });

    it('should throw on create pattern error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Pattern creation failed' }),
      });

      await expect(
        applicationRegistryService.createPattern(1, { pattern: '', priority: 0 })
      ).rejects.toThrow();
    });
  });

  describe('deletePattern', () => {
    it('should delete pattern and unwrap JSend response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: { message: 'Pattern deleted' },
        }),
      });

      const result = await applicationRegistryService.deletePattern(42);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/application-registry/patterns/42'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.message).toBe('Pattern deleted');
    });

    it('should throw on delete pattern error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(applicationRegistryService.deletePattern(42)).rejects.toThrow();
    });
  });
});
