import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UploadAndParseWeeklyCorrectiveUseCase } from '@weekly-corrective/application/use-cases/upload-and-parse-weekly-corrective.use-case';
import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import { WeeklyCorrectiveFactory } from '../../helpers/weekly-corrective.factory';

describe('UploadAndParseWeeklyCorrectiveUseCase', () => {
  let uploadAndParseUseCase: UploadAndParseWeeklyCorrectiveUseCase;
  let mockRepository: MockProxy<IWeeklyCorrectiveRepository>;

  beforeEach(() => {
    mockRepository = mock<IWeeklyCorrectiveRepository>();
    uploadAndParseUseCase = new UploadAndParseWeeklyCorrectiveUseCase(mockRepository);
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

    const validRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(3);

    const result = await uploadAndParseUseCase.execute(validRecords);

    expect(result.message).toBe('File uploaded and parsed successfully');
    expect(result.imported).toBe(3);
    expect(result.total).toBe(3);
    expect(mockRepository.deleteAll).toHaveBeenCalledOnce();
    expect(mockRepository.bulkCreate).toHaveBeenCalledOnce();
  });

  it('should throw error for missing required fields', async () => {
    const invalidRecords = [
      WeeklyCorrectiveFactory.createWeeklyCorrective({ requestId: '', aplicativos: '' }),
    ];

    await expect(uploadAndParseUseCase.execute(invalidRecords)).rejects.toThrow('missing required fields');
  });

  it('should handle repository errors', async () => {
    mockRepository.deleteAll.mockRejectedValue(new Error('Database error'));

    const validRecords = WeeklyCorrectiveFactory.createManyWeeklyCorrectives(2);

    await expect(uploadAndParseUseCase.execute(validRecords)).rejects.toThrow('Database error');
  });
});
