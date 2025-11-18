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
    const expectedWarRooms = WarRoomsFactory.createManyWarRooms(3);

    mockRepository.findAll.mockResolvedValue(expectedWarRooms);
    mockRepository.countAll.mockResolvedValue(3);

    const result = await getAllWarRoomsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(mockRepository.countAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: expectedWarRooms, total: 3 });
  });

  it('should return empty array when no war rooms exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);
    mockRepository.countAll.mockResolvedValue(0);

    const result = await getAllWarRoomsUseCase.execute();

    expect(result).toEqual({ data: [], total: 0 });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(getAllWarRoomsUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should call findAll and countAll in parallel', async () => {
    const expectedWarRooms = WarRoomsFactory.createManyWarRooms(2);

    mockRepository.findAll.mockResolvedValue(expectedWarRooms);
    mockRepository.countAll.mockResolvedValue(2);

    await getAllWarRoomsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(mockRepository.countAll).toHaveBeenCalled();
  });
});
