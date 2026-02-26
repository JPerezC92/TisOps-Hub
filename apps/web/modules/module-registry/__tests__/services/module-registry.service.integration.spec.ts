import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { moduleRegistryService } from '@/modules/module-registry/services/module-registry.service';
import { ModuleFactory } from '../helpers/module.factory';

describe('moduleRegistryService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all modules and unwrap JSend response', async () => {
      const mockModules = ModuleFactory.createMany(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockModules,
        }),
      });

      const result = await moduleRegistryService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/module-registry'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result).toHaveLength(5);
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: [],
        }),
      });

      const result = await moduleRegistryService.getAll();

      expect(result).toHaveLength(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(moduleRegistryService.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch module by id and unwrap JSend response', async () => {
      const mockModule = ModuleFactory.create({ id: 1 });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockModule,
        }),
      });

      const result = await moduleRegistryService.getById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/module-registry/1'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.id).toBe(1);
    });

    it('should throw error when not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      await expect(moduleRegistryService.getById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create module and unwrap JSend response', async () => {
      const createData = { sourceValue: 'SB2 ChatBot', displayValue: 'ChatBot', application: 'SB' };
      const mockCreated = ModuleFactory.create({
        ...createData,
        id: 1,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockCreated,
        }),
      });

      const result = await moduleRegistryService.create(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/module-registry'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.sourceValue).toBe('SB2 ChatBot');
      expect(result.displayValue).toBe('ChatBot');
      expect(result.application).toBe('SB');
    });

    it('should send isActive: true by default', async () => {
      const createData = { sourceValue: 'Test', displayValue: 'Test Module', application: 'CD' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: ModuleFactory.create(createData),
        }),
      });

      await moduleRegistryService.create(createData);

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
        moduleRegistryService.create({ sourceValue: '', displayValue: '', application: '' })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update module and unwrap JSend response', async () => {
      const updateData = { displayValue: 'Updated Module' };
      const mockUpdated = ModuleFactory.create({
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

      const result = await moduleRegistryService.update(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/module-registry/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.displayValue).toBe('Updated Module');
    });

    it('should throw on update error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Update failed' }),
      });

      await expect(
        moduleRegistryService.update(1, { displayValue: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete module', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: { deleted: true },
        }),
      });

      await moduleRegistryService.delete(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/module-registry/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw on delete error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(moduleRegistryService.delete(1)).rejects.toThrow();
    });
  });
});
