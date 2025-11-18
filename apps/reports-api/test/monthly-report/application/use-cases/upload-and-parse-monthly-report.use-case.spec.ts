import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { HttpException } from '@nestjs/common';
import { UploadAndParseMonthlyReportUseCase } from '@monthly-report/application/use-cases/upload-and-parse-monthly-report.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import * as XLSX from 'xlsx';

describe('UploadAndParseMonthlyReportUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseMonthlyReportUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    uploadAndParseUseCase = new UploadAndParseMonthlyReportUseCase(mockRepository);
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
        'Request ID': 123456,
        'Aplicativos': 'Somos Belcorp',
        'Categorización': 'Incidente',
        'Created Time': '01/01/2025 10:00',
        'Request Status': 'Cerrado',
        'Modulo.': 'Pedidos',
        'Subject': 'Test subject',
        'Priority': 'Alta',
        'ETA': '02/01/2025',
        'Información Adicional': 'Test info',
        'Resolved Time': '01/01/2025 15:00',
        'Países Afectados': 'Peru',
        'Recurrencia': 'No',
        'Technician': 'John Doe',
        'Jira': 'JIRA-1234',
        'Problem ID': 'PROB-123',
        'Linked Request Id': '123457',
        'Request OLA Status': 'Not Violated',
        'Grupo Escalamiento': 'Nivel 2',
        'Aplicactivos Afectados': 'Portal Web',
        '¿Este Incidente se debió Resolver en Nivel 1?': 'No',
        'Campaña': 'C1-2025',
        'CUV_1': 'CUV123456',
        'Release': 'v1.0.0',
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
    expect(result.unique).toBe(1);
    expect(result.merged).toBe(0);
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
    const data = [{ 'Request ID': 123456, 'Aplicativos': 'Test' }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    await expect(uploadAndParseUseCase.execute(buffer)).rejects.toThrow();
  });
});
