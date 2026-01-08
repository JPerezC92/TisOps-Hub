import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UploadAndParseProblemsUseCase } from '@problems/application/use-cases/upload-and-parse-problems.use-case';
import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';
import type { InsertProblem } from '@repo/database';

describe('UploadAndParseProblemsUseCase', () => {
  let useCase: UploadAndParseProblemsUseCase;
  let mockRepository: MockProxy<IProblemsRepository>;

  beforeEach(() => {
    mockRepository = mock<IProblemsRepository>();
    useCase = new UploadAndParseProblemsUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should successfully process valid records', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 131205,
          requestIdLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Test problem',
          subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          technician: 'Tech Support',
          planesDeAccion: 'Plan A',
          observaciones: 'Some observations',
          dueByTime: '25/11/2025 11:34',
        },
      ];

      mockRepository.deleteAll.mockResolvedValue(0);
      mockRepository.bulkCreate.mockResolvedValue();

      const result = await useCase.execute(records);

      expect(result).toEqual({
        message: 'File uploaded and parsed successfully',
        imported: 1,
        total: 1,
      });
      expect(mockRepository.deleteAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.bulkCreate).toHaveBeenCalledWith(records);
    });

    it('should reject records with missing requestId', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 0, // Invalid
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Test',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          technician: 'Tech Support',
          planesDeAccion: 'Plan A',
          observaciones: 'Some observations',
          dueByTime: '25/11/2025 11:34',
        },
      ];

      await expect(useCase.execute(records)).rejects.toThrow(
        'Some records are missing required fields (Request ID, Aplicativos)',
      );
      expect(mockRepository.deleteAll).not.toHaveBeenCalled();
      expect(mockRepository.bulkCreate).not.toHaveBeenCalled();
    });

    it('should reject records with missing aplicativos', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 131205,
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Test',
          createdTime: '17/10/2025 11:34',
          aplicativos: '', // Invalid
          createdBy: 'John Doe',
          technician: 'Tech Support',
          planesDeAccion: 'Plan A',
          observaciones: 'Some observations',
          dueByTime: '25/11/2025 11:34',
        },
      ];

      await expect(useCase.execute(records)).rejects.toThrow(
        'Some records are missing required fields (Request ID, Aplicativos)',
      );
      expect(mockRepository.deleteAll).not.toHaveBeenCalled();
      expect(mockRepository.bulkCreate).not.toHaveBeenCalled();
    });

    it('should remove duplicate records by requestId', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 131205,
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'First occurrence',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          technician: 'Tech Support 1',
          planesDeAccion: 'Plan A',
          observaciones: 'Obs 1',
          dueByTime: '25/11/2025 11:34',
        },
        {
          requestId: 131205, // Duplicate
          serviceCategory: 'Problemas',
          requestStatus: 'En Progreso',
          subject: 'Second occurrence',
          createdTime: '18/10/2025 10:00',
          aplicativos: 'Unete 3.0',
          createdBy: 'Jane Smith',
          technician: 'Tech Support 2',
          planesDeAccion: 'Plan B',
          observaciones: 'Obs 2',
          dueByTime: '26/11/2025 10:00',
        },
        {
          requestId: 129476, // Different
          serviceCategory: 'Problemas',
          requestStatus: 'Abierto',
          subject: 'Another problem',
          createdTime: '10/10/2025 18:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'Bob Wilson',
          technician: 'Tech Support 3',
          planesDeAccion: 'Plan C',
          observaciones: 'Obs 3',
          dueByTime: '19/11/2025 18:00',
        },
      ];

      mockRepository.deleteAll.mockResolvedValue(0);
      mockRepository.bulkCreate.mockResolvedValue();

      const result = await useCase.execute(records);

      expect(result).toEqual({
        message: 'File uploaded and parsed successfully',
        imported: 2, // Only 2 unique records
        total: 3, // 3 total records
      });

      // Should only insert the unique records (keeping the first occurrence)
      expect(mockRepository.bulkCreate).toHaveBeenCalledWith([
        records[0], // First occurrence of 131205
        records[2], // 129476
      ]);
    });

    it('should handle multiple records successfully', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 131205,
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Problem 1',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          technician: 'Tech Support 1',
          planesDeAccion: 'Plan A',
          observaciones: 'Obs 1',
          dueByTime: '25/11/2025 11:34',
        },
        {
          requestId: 129476,
          serviceCategory: 'Problemas',
          requestStatus: 'En Progreso',
          subject: 'Problem 2',
          createdTime: '10/10/2025 18:34',
          aplicativos: 'Somos Belcorp 2.0',
          createdBy: 'Jane Smith',
          technician: 'Tech Support 2',
          planesDeAccion: 'No asignado',
          observaciones: 'No asignado',
          dueByTime: '19/11/2025 18:00',
        },
      ];

      mockRepository.deleteAll.mockResolvedValue(5);
      mockRepository.bulkCreate.mockResolvedValue();

      const result = await useCase.execute(records);

      expect(result).toEqual({
        message: 'File uploaded and parsed successfully',
        imported: 2,
        total: 2,
      });
      expect(mockRepository.deleteAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.bulkCreate).toHaveBeenCalledWith(records);
    });

    it('should propagate repository errors during deletion', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 131205,
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Test',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          technician: 'Tech Support',
          planesDeAccion: 'Plan A',
          observaciones: 'Obs',
          dueByTime: '25/11/2025 11:34',
        },
      ];

      const error = new Error('Database deletion failed');
      mockRepository.deleteAll.mockRejectedValue(error);

      await expect(useCase.execute(records)).rejects.toThrow('Database deletion failed');
      expect(mockRepository.bulkCreate).not.toHaveBeenCalled();
    });

    it('should propagate repository errors during bulk creation', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 131205,
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Test',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          technician: 'Tech Support',
          planesDeAccion: 'Plan A',
          observaciones: 'Obs',
          dueByTime: '25/11/2025 11:34',
        },
      ];

      mockRepository.deleteAll.mockResolvedValue(0);
      const error = new Error('Database insertion failed');
      mockRepository.bulkCreate.mockRejectedValue(error);

      await expect(useCase.execute(records)).rejects.toThrow('Database insertion failed');
    });
  });
});
