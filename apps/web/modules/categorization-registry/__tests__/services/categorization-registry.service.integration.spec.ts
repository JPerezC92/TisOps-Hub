import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { categorizationRegistryService } from '@/modules/categorization-registry/services/categorization-registry.service';
import { CategorizationFactory } from '../helpers/categorization.factory';

describe('categorizationRegistryService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all categorizations and unwrap JSend response', async () => {
      const mockCategorizations = CategorizationFactory.createMany(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockCategorizations,
        }),
      });

      const result = await categorizationRegistryService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/categorization-registry'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result).toHaveLength(5);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(categorizationRegistryService.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch categorization by id and unwrap JSend response', async () => {
      const mockCategorization = CategorizationFactory.create({ id: 1 });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockCategorization,
        }),
      });

      const result = await categorizationRegistryService.getById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/categorization-registry/1'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.id).toBe(1);
    });

    it('should throw error when not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      await expect(categorizationRegistryService.getById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create categorization and unwrap JSend response', async () => {
      const createData = { sourceValue: 'Test Source', displayValue: 'Test Display' };
      const mockCreated = CategorizationFactory.create({
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

      const result = await categorizationRegistryService.create(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/categorization-registry'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.sourceValue).toBe('Test Source');
      expect(result.displayValue).toBe('Test Display');
    });

    it('should send isActive: true by default', async () => {
      const createData = { sourceValue: 'Test', displayValue: 'Test' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: CategorizationFactory.create(createData),
        }),
      });

      await categorizationRegistryService.create(createData);

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
        categorizationRegistryService.create({ sourceValue: '', displayValue: '' })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update categorization and unwrap JSend response', async () => {
      const updateData = { displayValue: 'Updated Display' };
      const mockUpdated = CategorizationFactory.create({
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

      const result = await categorizationRegistryService.update(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/categorization-registry/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.displayValue).toBe('Updated Display');
    });

    it('should throw on update error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Update failed' }),
      });

      await expect(
        categorizationRegistryService.update(1, { displayValue: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete categorization', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: null,
        }),
      });

      await categorizationRegistryService.delete(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/categorization-registry/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw on delete error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(categorizationRegistryService.delete(1)).rejects.toThrow();
    });
  });
});
