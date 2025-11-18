import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { HttpException } from '@nestjs/common';
import { UploadAndParseWarRoomsUseCase } from '@war-rooms/application/use-cases/upload-and-parse-war-rooms.use-case';
import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import * as XLSX from 'xlsx';

describe('UploadAndParseWarRoomsUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseWarRoomsUseCase;
  let mockRepository: MockProxy<IWarRoomsRepository>;

  beforeEach(() => {
    mockRepository = mock<IWarRoomsRepository>();
    uploadAndParseUseCase = new UploadAndParseWarRoomsUseCase(mockRepository);
    vi.clearAllMocks();
  });

  it('should throw error for empty Excel file', async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow(HttpException);
    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow('Excel file is empty');
  });

  it('should parse valid Excel data successfully', async () => {
    mockRepository.deleteAll.mockResolvedValue(0);
    mockRepository.bulkCreate.mockResolvedValue(undefined);

    const workbook = XLSX.utils.book_new();
    const data = [
      {
        'Incident ID': 1234,
        'Application': 'FFVV',
        'Date': 44927,
        'Summary': 'Test incident',
        'Initial Priority': 'HIGH',
        'Start Time': 0.5,
        'Duration (Minutes)': 120,
        'End Time': 0.583333,
        'Participants': 5,
        'Status': 'Closed',
        'Priority Changed': 'No',
        'Resolution team changed': 'No',
        'Notes': 'Test notes',
        'RCA Status': 'Completed',
        'URL RCA': 'https://rca.example.com',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const result = await uploadAndParseUseCase.execute(buffer);

    expect(result.message).toBe('File uploaded and parsed successfully');
    expect(result.imported).toBe(1);
    expect(result.total).toBe(1);
    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreate).toHaveBeenCalledOnce();
  });

  it('should throw error for missing required fields', async () => {
    const workbook = XLSX.utils.book_new();
    const data = [
      {
        'Incident ID': null,
        'Application': '',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow(HttpException);
    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow('missing required fields');
  });

  it('should handle repository errors', async () => {
    mockRepository.deleteAll.mockRejectedValue(new Error('Database error'));

    const workbook = XLSX.utils.book_new();
    const data = [{ 'Incident ID': 1234, 'Application': 'FFVV' }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow();
  });
});
