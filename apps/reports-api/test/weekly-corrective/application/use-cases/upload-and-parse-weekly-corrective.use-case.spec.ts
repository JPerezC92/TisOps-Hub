import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { HttpException } from '@nestjs/common';
import { UploadAndParseWeeklyCorrectiveUseCase } from '@weekly-corrective/application/use-cases/upload-and-parse-weekly-corrective.use-case';
import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import * as XLSX from 'xlsx';

describe('UploadAndParseWeeklyCorrectiveUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseWeeklyCorrectiveUseCase;
  let mockRepository: MockProxy<IWeeklyCorrectiveRepository>;

  beforeEach(() => {
    mockRepository = mock<IWeeklyCorrectiveRepository>();
    uploadAndParseUseCase = new UploadAndParseWeeklyCorrectiveUseCase(mockRepository);
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
        'Request ID': 'REQ-123456',
        'Technician': 'John Doe',
        'Aplicativos': 'Somos Belcorp',
        'Categorización': 'Incidente',
        'Created Time': '01/01/2025 10:00',
        'Request Status': 'Cerrado',
        'Modulo.': 'Pedidos',
        'Subject': 'Test subject',
        'Priority': 'Alta',
        'ETA': '02/01/2025',
        'RCA': 'https://rca.example.com',
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
        'Request ID': null,
        'Aplicativos': '',
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
    const data = [{ 'Request ID': 'REQ-123456', 'Aplicativos': 'Test' }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow();
  });
});
