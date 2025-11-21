import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UploadAndParseMonthlyReportUseCase } from '@monthly-report/application/use-cases/upload-and-parse-monthly-report.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('UploadAndParseMonthlyReportUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseMonthlyReportUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    uploadAndParseUseCase = new UploadAndParseMonthlyReportUseCase(mockRepository);
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

    const validRecords = MonthlyReportFactory.createManyMonthlyReports(3);

    const result = await uploadAndParseUseCase.execute(validRecords);

    expect(result.message).toBe('File uploaded and parsed successfully');
    expect(result.imported).toBe(3);
    expect(result.total).toBe(3);
    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreate).toHaveBeenCalledOnce();
  });

  it('should throw error for missing required fields', async () => {
    const invalidRecords = [
      MonthlyReportFactory.createMonthlyReport({ requestId: 0, aplicativos: '' }),
    ];

    await expect(uploadAndParseUseCase.execute(invalidRecords)).rejects.toThrow('missing required fields');
  });

  it('should handle repository errors', async () => {
    mockRepository.deleteAll.mockRejectedValue(new Error('Database error'));

    const validRecords = MonthlyReportFactory.createManyMonthlyReports(2);

    await expect(uploadAndParseUseCase.execute(validRecords)).rejects.toThrow('Database error');
  });
});
