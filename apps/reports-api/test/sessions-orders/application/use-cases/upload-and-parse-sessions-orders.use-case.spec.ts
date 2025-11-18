import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { HttpException } from '@nestjs/common';
import { UploadAndParseSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/upload-and-parse-sessions-orders.use-case';
import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import * as XLSX from 'xlsx';

describe('UploadAndParseSessionsOrdersUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseSessionsOrdersUseCase;
  let mockRepository: MockProxy<ISessionsOrdersRepository>;

  beforeEach(() => {
    mockRepository = mock<ISessionsOrdersRepository>();
    uploadAndParseUseCase = new UploadAndParseSessionsOrdersUseCase(mockRepository);
    vi.clearAllMocks();
  });

  it('should throw error for empty main sheet', async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet1 = XLSX.utils.aoa_to_sheet([]);
    const worksheet3 = XLSX.utils.aoa_to_sheet([['header']]);
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Hoja1');
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Hoja3');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow(HttpException);
    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow('Main sheet (Hoja1) is empty');
  });

  it('should parse valid Excel data successfully', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(0);
    mockRepository.deleteAllReleases.mockResolvedValue(0);
    mockRepository.bulkCreateMain.mockResolvedValue(undefined);
    mockRepository.bulkCreateReleases.mockResolvedValue(undefined);

    const workbook = XLSX.utils.book_new();

    // Hoja1 data
    const hoja1Data = [
      {
        'año': 2025,
        'mes': 1,
        'peak': 1,
        'dia': 45000,
        'incidentes': 10,
        'placed orders': 500,
        'billed orders': 450,
      },
    ];
    const worksheet1 = XLSX.utils.json_to_sheet(hoja1Data);
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Hoja1');

    // Hoja3 data
    const hoja3Data = [
      {
        'SEMANA': 'S1',
        'APLICACIÓN': 'SB',
        'FECHA': 45000,
        'RELEASE': 'v1.0.0',
        'tickets ': 5,
        '# TICKETS': 'TICKET-1',
        '__EMPTY': 'TICKET-2',
      },
    ];
    const worksheet3 = XLSX.utils.json_to_sheet(hoja3Data);
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Hoja3');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const result = await uploadAndParseUseCase.execute(buffer);

    expect(result.message).toBe('File uploaded and parsed successfully');
    expect(result.importedMain).toBe(1);
    expect(result.importedReleases).toBe(1);
    expect(result.totalMain).toBe(1);
    expect(result.totalReleases).toBe(1);
    expect(mockRepository.deleteAllMain).toHaveBeenCalledOnce();
    expect(mockRepository.deleteAllReleases).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreateMain).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreateReleases).toHaveBeenCalledOnce();
  });

  it('should handle repository errors during deletion', async () => {
    mockRepository.deleteAllMain.mockRejectedValue(new Error('Database error'));

    const workbook = XLSX.utils.book_new();
    const hoja1Data = [{ 'año': 2025, 'mes': 1 }];
    const worksheet1 = XLSX.utils.json_to_sheet(hoja1Data);
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Hoja1');
    const worksheet3 = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Hoja3');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow();
  });

  it('should handle empty releases sheet', async () => {
    mockRepository.deleteAllMain.mockResolvedValue(0);
    mockRepository.deleteAllReleases.mockResolvedValue(0);
    mockRepository.bulkCreateMain.mockResolvedValue(undefined);
    mockRepository.bulkCreateReleases.mockResolvedValue(undefined);

    const workbook = XLSX.utils.book_new();

    const hoja1Data = [{ 'año': 2025, 'mes': 1, 'peak': 1, 'dia': 45000, 'incidentes': 5, 'placed orders': 100, 'billed orders': 90 }];
    const worksheet1 = XLSX.utils.json_to_sheet(hoja1Data);
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Hoja1');

    const worksheet3 = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Hoja3');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const result = await uploadAndParseUseCase.execute(buffer);

    expect(result.importedMain).toBe(1);
    expect(result.importedReleases).toBe(0);
  });
});
