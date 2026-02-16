import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { correctiveStatusRegistryService } from '@/modules/corrective-status-registry/services/corrective-status-registry.service';
import { CorrectiveStatusFactory } from '../helpers/corrective-status.factory';

describe('correctiveStatusRegistryService (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all statuses and unwrap JSend response', async () => {
      const mockStatuses = CorrectiveStatusFactory.createMany(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockStatuses,
        }),
      });

      const result = await correctiveStatusRegistryService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/corrective-status-registry'),
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

      const result = await correctiveStatusRegistryService.getAll();

      expect(result).toHaveLength(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(correctiveStatusRegistryService.getAll()).rejects.toThrow();
    });
  });

  describe('getDisplayStatusOptions', () => {
    it('should fetch display status options and unwrap JSend response', async () => {
      const mockOptions = ['In Backlog', 'Dev in Progress', 'In Testing', 'PRD Deployment'];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockOptions,
        }),
      });

      const result = await correctiveStatusRegistryService.getDisplayStatusOptions();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/corrective-status-registry/display-statuses'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result).toEqual(mockOptions);
    });

    it('should handle empty options', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: [],
        }),
      });

      const result = await correctiveStatusRegistryService.getDisplayStatusOptions();

      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should fetch status by id and unwrap JSend response', async () => {
      const mockStatus = CorrectiveStatusFactory.create({ id: 1 });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockStatus,
        }),
      });

      const result = await correctiveStatusRegistryService.getById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/corrective-status-registry/1'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.id).toBe(1);
    });

    it('should throw error when not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      await expect(correctiveStatusRegistryService.getById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create status and unwrap JSend response', async () => {
      const createData = { rawStatus: 'En Cola', displayStatus: 'In Backlog' };
      const mockCreated = CorrectiveStatusFactory.create({
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

      const result = await correctiveStatusRegistryService.create(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/corrective-status-registry'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.rawStatus).toBe('En Cola');
      expect(result.displayStatus).toBe('In Backlog');
    });

    it('should send isActive: true by default', async () => {
      const createData = { rawStatus: 'Test', displayStatus: 'In Testing' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: CorrectiveStatusFactory.create(createData),
        }),
      });

      await correctiveStatusRegistryService.create(createData);

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
        correctiveStatusRegistryService.create({ rawStatus: '', displayStatus: '' })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update status and unwrap JSend response', async () => {
      const updateData = { displayStatus: 'PRD Deployment' };
      const mockUpdated = CorrectiveStatusFactory.create({
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

      const result = await correctiveStatusRegistryService.update(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/corrective-status-registry/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.displayStatus).toBe('PRD Deployment');
    });

    it('should throw on update error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Update failed' }),
      });

      await expect(
        correctiveStatusRegistryService.update(1, { displayStatus: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete status', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: null,
        }),
      });

      await correctiveStatusRegistryService.delete(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/corrective-status-registry/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw on delete error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(correctiveStatusRegistryService.delete(1)).rejects.toThrow();
    });
  });
});
