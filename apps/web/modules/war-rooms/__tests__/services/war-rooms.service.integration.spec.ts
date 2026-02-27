import { describe, it, expect, vi, beforeEach } from 'vitest';
import { warRoomsService } from '../../services/war-rooms.service';
import { createManyWarRooms } from '../helpers/war-rooms.factory';

const mockApiClient = vi.hoisted(() => ({
  get: vi.fn(),
  postForm: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: mockApiClient,
}));

describe('warRoomsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return war rooms data unwrapped from JSend', async () => {
      const mockWarRooms = createManyWarRooms(3);
      mockApiClient.get.mockResolvedValue({
        status: 'success',
        data: { data: mockWarRooms, total: 3 },
      });

      const result = await warRoomsService.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/war-rooms');
      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should return empty array when no records', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 'success',
        data: { data: [], total: 0 },
      });

      const result = await warRoomsService.getAll();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('upload', () => {
    it('should upload file and return unwrapped result', async () => {
      mockApiClient.postForm.mockResolvedValue({
        status: 'success',
        data: { message: 'File uploaded', imported: 10, total: 10 },
      });

      const file = new File(['content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await warRoomsService.upload(file);

      expect(mockApiClient.postForm).toHaveBeenCalledWith(
        '/war-rooms/upload',
        expect.any(FormData)
      );
      expect(result.message).toBe('File uploaded');
      expect(result.imported).toBe(10);
    });

    it('should propagate upload errors', async () => {
      mockApiClient.postForm.mockRejectedValue(new Error('Upload failed'));

      const file = new File(['content'], 'test.xlsx');

      await expect(warRoomsService.upload(file)).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteAll', () => {
    it('should delete all and return unwrapped result', async () => {
      mockApiClient.delete.mockResolvedValue({
        status: 'success',
        data: { message: 'All deleted', deleted: 50 },
      });

      const result = await warRoomsService.deleteAll();

      expect(mockApiClient.delete).toHaveBeenCalledWith('/war-rooms');
      expect(result.message).toBe('All deleted');
      expect(result.deleted).toBe(50);
    });

    it('should propagate delete errors', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(warRoomsService.deleteAll()).rejects.toThrow('Delete failed');
    });
  });
});
