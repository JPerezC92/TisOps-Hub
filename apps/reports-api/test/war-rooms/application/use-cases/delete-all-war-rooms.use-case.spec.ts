import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { DeleteAllWarRoomsUseCase } from '@war-rooms/application/use-cases/delete-all-war-rooms.use-case';
import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';

describe('DeleteAllWarRoomsUseCase', () => {
  let deleteAllWarRoomsUseCase: DeleteAllWarRoomsUseCase;
  let mockRepository: MockProxy<IWarRoomsRepository>;

  beforeEach(() => {
    mockRepository = mock<IWarRoomsRepository>();
    deleteAllWarRoomsUseCase = new DeleteAllWarRoomsUseCase(mockRepository);
  });

  it('should delete all war rooms', async () => {
    mockRepository.deleteAll.mockResolvedValue(75);

    const result = await deleteAllWarRoomsUseCase.execute();

    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(result).toEqual({
      message: 'All war rooms records deleted successfully',
      deleted: 75,
    });
  });

  it('should return zero when no records to delete', async () => {
    mockRepository.deleteAll.mockResolvedValue(0);

    const result = await deleteAllWarRoomsUseCase.execute();

    expect(result.deleted).toBe(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.deleteAll.mockRejectedValue(error);

    await expect(deleteAllWarRoomsUseCase.execute()).rejects.toThrow('Database error');
  });
});
