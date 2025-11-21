import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllWarRoomsUseCase } from '@war-rooms/application/use-cases/get-all-war-rooms.use-case';
import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import { WarRoomsFactory } from '../../helpers/war-rooms.factory';

describe('GetAllWarRoomsUseCase', () => {
  let getAllWarRoomsUseCase: GetAllWarRoomsUseCase;
  let mockRepository: MockProxy<IWarRoomsRepository>;

  beforeEach(() => {
    mockRepository = mock<IWarRoomsRepository>();
    getAllWarRoomsUseCase = new GetAllWarRoomsUseCase(mockRepository);
  });

  it('should return all war rooms', async () => {
    const expectedWarRooms = WarRoomsFactory.createManyWarRoomsWithApp(3);

    mockRepository.findAllWithApplication.mockResolvedValue(expectedWarRooms);
    mockRepository.countAll.mockResolvedValue(3);

    const result = await getAllWarRoomsUseCase.execute();

    expect(mockRepository.findAllWithApplication).toHaveBeenCalledOnce();
    expect(mockRepository.countAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: expectedWarRooms, total: 3 });
  });

  it('should return empty array when no war rooms exist', async () => {
    mockRepository.findAllWithApplication.mockResolvedValue([]);
    mockRepository.countAll.mockResolvedValue(0);

    const result = await getAllWarRoomsUseCase.execute();

    expect(result).toEqual({ data: [], total: 0 });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAllWithApplication.mockRejectedValue(error);

    await expect(getAllWarRoomsUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should call findAllWithApplication and countAll in parallel', async () => {
    const expectedWarRooms = WarRoomsFactory.createManyWarRoomsWithApp(2);

    mockRepository.findAllWithApplication.mockResolvedValue(expectedWarRooms);
    mockRepository.countAll.mockResolvedValue(2);

    await getAllWarRoomsUseCase.execute();

    expect(mockRepository.findAllWithApplication).toHaveBeenCalled();
    expect(mockRepository.countAll).toHaveBeenCalled();
  });

  describe('executeWithFilters', () => {
    it('should return filtered war rooms by app', async () => {
      const expectedWarRooms = WarRoomsFactory.createManyWarRoomsWithApp(3, {
        app: { id: 1, code: 'FFVV', name: 'FFVV Application' }
      });

      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(expectedWarRooms);
      mockRepository.countFiltered.mockResolvedValue(3);

      const result = await getAllWarRoomsUseCase.executeWithFilters('FFVV', undefined);

      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalledWith('FFVV', undefined);
      expect(mockRepository.countFiltered).toHaveBeenCalledWith('FFVV', undefined);
      expect(result).toEqual({ data: expectedWarRooms, total: 3 });
    });

    it('should return filtered war rooms by month', async () => {
      const expectedWarRooms = WarRoomsFactory.createManyWarRoomsWithApp(5);

      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(expectedWarRooms);
      mockRepository.countFiltered.mockResolvedValue(5);

      const result = await getAllWarRoomsUseCase.executeWithFilters(undefined, '2025-01');

      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalledWith(undefined, '2025-01');
      expect(mockRepository.countFiltered).toHaveBeenCalledWith(undefined, '2025-01');
      expect(result).toEqual({ data: expectedWarRooms, total: 5 });
    });

    it('should return filtered war rooms by both app and month', async () => {
      const expectedWarRooms = WarRoomsFactory.createManyWarRoomsWithApp(2, {
        app: { id: 2, code: 'B2B', name: 'B2B Application' }
      });

      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(expectedWarRooms);
      mockRepository.countFiltered.mockResolvedValue(2);

      const result = await getAllWarRoomsUseCase.executeWithFilters('B2B', '2025-02');

      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalledWith('B2B', '2025-02');
      expect(mockRepository.countFiltered).toHaveBeenCalledWith('B2B', '2025-02');
      expect(result).toEqual({ data: expectedWarRooms, total: 2 });
    });

    it('should return empty array when no matches found', async () => {
      mockRepository.findAllWithApplicationFiltered.mockResolvedValue([]);
      mockRepository.countFiltered.mockResolvedValue(0);

      const result = await getAllWarRoomsUseCase.executeWithFilters('UNKNOWN', '2025-12');

      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findAllWithApplicationFiltered.mockRejectedValue(error);

      await expect(getAllWarRoomsUseCase.executeWithFilters('FFVV', '2025-01'))
        .rejects.toThrow('Database connection failed');
    });

    it('should call repository methods in parallel', async () => {
      const expectedWarRooms = WarRoomsFactory.createManyWarRoomsWithApp(3);

      mockRepository.findAllWithApplicationFiltered.mockResolvedValue(expectedWarRooms);
      mockRepository.countFiltered.mockResolvedValue(3);

      await getAllWarRoomsUseCase.executeWithFilters('FFVV', '2025-01');

      expect(mockRepository.findAllWithApplicationFiltered).toHaveBeenCalled();
      expect(mockRepository.countFiltered).toHaveBeenCalled();
    });
  });
});
