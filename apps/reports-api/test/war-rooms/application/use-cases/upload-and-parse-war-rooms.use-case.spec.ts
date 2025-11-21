import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UploadAndParseWarRoomsUseCase } from '@war-rooms/application/use-cases/upload-and-parse-war-rooms.use-case';
import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import { WarRoomsFactory } from '../../helpers/war-rooms.factory';

describe('UploadAndParseWarRoomsUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseWarRoomsUseCase;
  let mockRepository: MockProxy<IWarRoomsRepository>;

  beforeEach(() => {
    mockRepository = mock<IWarRoomsRepository>();
    uploadAndParseUseCase = new UploadAndParseWarRoomsUseCase(mockRepository);
  });

  it('should handle empty records array', async () => {
    mockRepository.deleteAll.mockResolvedValue(0);
    mockRepository.bulkCreate.mockResolvedValue(undefined);

    const emptyRecords = [];

    const result = await uploadAndParseUseCase.execute(emptyRecords);

    expect(result.imported).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should parse valid records successfully', async () => {
    mockRepository.deleteAll.mockResolvedValue(0);
    mockRepository.bulkCreate.mockResolvedValue(undefined);

    const validRecords = WarRoomsFactory.createManyWarRooms(3);

    const result = await uploadAndParseUseCase.execute(validRecords);

    expect(result.message).toBe('File uploaded and parsed successfully');
    expect(result.imported).toBe(3);
    expect(result.total).toBe(3);
    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreate).toHaveBeenCalledOnce();
  });

  it('should throw error for missing required fields', async () => {
    const invalidRecords = [
      WarRoomsFactory.createWarRoom({ requestId: 0, application: '' }),
    ];

    await expect(uploadAndParseUseCase.execute(invalidRecords)).rejects.toThrow('missing required fields');
  });

  it('should handle repository errors', async () => {
    mockRepository.deleteAll.mockRejectedValue(new Error('Database error'));

    const validRecords = WarRoomsFactory.createManyWarRooms(2);

    await expect(uploadAndParseUseCase.execute(validRecords)).rejects.toThrow('Database error');
  });
});
