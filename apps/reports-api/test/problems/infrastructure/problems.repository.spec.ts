import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProblemsRepository } from '@problems/infrastructure/repositories/problems.repository';
import type { InsertProblem, Problem } from '@repo/database';

describe('ProblemsRepository', () => {
  let repository: ProblemsRepository;
  let mockDb: any;

  beforeEach(() => {
    // Create a mock database instance
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      all: vi.fn(),
      execute: vi.fn(),
    };

    // Inject the mock database
    repository = new ProblemsRepository(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all problems from database', async () => {
      const mockProblems: Problem[] = [
        {
          requestId: 131205,
          requestIdLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Test problem 1',
          subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          technician: 'Tech Support 1',
          planesDeAccion: 'Plan A',
          observaciones: 'Some observations',
          dueByTime: '25/11/2025 11:34',
        },
        {
          requestId: 129476,
          requestIdLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=129476',
          serviceCategory: 'Problemas',
          requestStatus: 'En Progreso',
          subject: 'Test problem 2',
          subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=129476',
          createdTime: '10/10/2025 18:34',
          aplicativos: 'Somos Belcorp 2.0',
          createdBy: 'Jane Smith',
          technician: 'Tech Support 2',
          planesDeAccion: 'No asignado',
          observaciones: 'No asignado',
          dueByTime: '19/11/2025 18:00',
        },
      ];

      mockDb.all.mockResolvedValue(mockProblems);

      const result = await repository.findAll();

      expect(result).toEqual(mockProblems);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.all).toHaveBeenCalled();
    });

    it('should return empty array when no problems exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.all).toHaveBeenCalled();
    });
  });

  describe('countAll', () => {
    it('should return count of all problems', async () => {
      const mockProblems = new Array(42).fill({});
      mockDb.all.mockResolvedValue(mockProblems);

      const result = await repository.countAll();

      expect(result).toBe(42);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.all).toHaveBeenCalled();
    });

    it('should return 0 when no problems exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.countAll();

      expect(result).toBe(0);
    });
  });

  describe('bulkCreate', () => {
    it('should insert multiple problems successfully', async () => {
      const records: InsertProblem[] = [
        {
          requestId: 131205,
          requestIdLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
          serviceCategory: 'Problemas',
          requestStatus: 'Evaluar',
          subject: 'Test 1',
          subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
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
          subject: 'Test 2',
          createdTime: '10/10/2025 18:34',
          aplicativos: 'Somos Belcorp 2.0',
          createdBy: 'Jane Smith',
          technician: 'Tech Support 2',
          planesDeAccion: 'No asignado',
          observaciones: 'No asignado',
          dueByTime: '19/11/2025 18:00',
        },
      ];

      mockDb.execute.mockResolvedValue(undefined);

      await repository.bulkCreate(records);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it('should handle empty array gracefully', async () => {
      await repository.bulkCreate([]);

      // Should not call any db methods for empty array
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('deleteAll', () => {
    it('should delete all problems and return count', async () => {
      mockDb.execute.mockResolvedValue({ rowsAffected: 3 });

      const result = await repository.deleteAll();

      expect(result).toBe(3);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it('should return 0 when no problems exist to delete', async () => {
      mockDb.execute.mockResolvedValue({ rowsAffected: 0 });

      const result = await repository.deleteAll();

      expect(result).toBe(0);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it('should handle undefined rowsAffected', async () => {
      mockDb.execute.mockResolvedValue({});

      const result = await repository.deleteAll();

      expect(result).toBe(0);
    });
  });
});
