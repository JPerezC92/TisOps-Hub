import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { monthlyReportStatusRegistryService } from '@/modules/monthly-report-status-registry/services/monthly-report-status-registry.service';
import { MonthlyReportStatusFactory } from '../helpers/monthly-report-status.factory';

describe('monthlyReportStatusRegistryService (Integration)', () => {
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
      const mockStatuses = MonthlyReportStatusFactory.createMany(5);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockStatuses,
        }),
      });

      const result = await monthlyReportStatusRegistryService.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report-status-registry'),
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

      const result = await monthlyReportStatusRegistryService.getAll();

      expect(result).toHaveLength(0);
    });

    it('should throw error on server failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal server error' }),
      });

      await expect(monthlyReportStatusRegistryService.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch status by id and unwrap JSend response', async () => {
      const mockStatus = MonthlyReportStatusFactory.create({ id: 1 });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: mockStatus,
        }),
      });

      const result = await monthlyReportStatusRegistryService.getById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report-status-registry/1'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.id).toBe(1);
    });

    it('should throw error when not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      await expect(monthlyReportStatusRegistryService.getById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create status and unwrap JSend response', async () => {
      const createData = { rawStatus: 'En Proceso', displayStatus: 'On going L2' };
      const mockCreated = MonthlyReportStatusFactory.create({
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

      const result = await monthlyReportStatusRegistryService.create(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report-status-registry'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.rawStatus).toBe('En Proceso');
      expect(result.displayStatus).toBe('On going L2');
    });

    it('should send isActive: true by default', async () => {
      const createData = { rawStatus: 'Test', displayStatus: 'Closed' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: MonthlyReportStatusFactory.create(createData),
        }),
      });

      await monthlyReportStatusRegistryService.create(createData);

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
        monthlyReportStatusRegistryService.create({ rawStatus: '', displayStatus: '' })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update status and unwrap JSend response', async () => {
      const updateData = { displayStatus: 'Closed' };
      const mockUpdated = MonthlyReportStatusFactory.create({
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

      const result = await monthlyReportStatusRegistryService.update(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report-status-registry/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.displayStatus).toBe('Closed');
    });

    it('should throw on update error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Update failed' }),
      });

      await expect(
        monthlyReportStatusRegistryService.update(1, { displayStatus: 'Test' })
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

      await monthlyReportStatusRegistryService.delete(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report-status-registry/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw on delete error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      });

      await expect(monthlyReportStatusRegistryService.delete(1)).rejects.toThrow();
    });
  });
});
