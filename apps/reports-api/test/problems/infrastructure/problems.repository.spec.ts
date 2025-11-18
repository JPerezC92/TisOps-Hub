import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProblemsRepository } from '@problems/infrastructure/repositories/problems.repository';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { InsertProblem, Problem } from '@repo/database';
import { eq } from 'drizzle-orm';

// Mock drizzle-orm/libsql
vi.mock('drizzle-orm/libsql', () => ({
  drizzle: vi.fn(),
}));

describe('ProblemsRepository', () => {
  let repository: ProblemsRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      execute: vi.fn(),
    };
    repository = new ProblemsRepository(mockDb as unknown as LibSQLDatabase<any>);
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
          subject: 'Test problem 1',
          subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          planesDeAccion: 'Plan A',
          observaciones: 'Some observations',
          dueByTime: '25/11/2025 11:34',
        },
        {
          requestId: 129476,
          requestIdLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=129476',
          serviceCategory: 'Problemas',
          subject: 'Test problem 2',
          subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=129476',
          createdTime: '10/10/2025 18:34',
          aplicativos: 'Somos Belcorp 2.0',
          createdBy: 'Jane Smith',
          planesDeAccion: 'No asignado',
          observaciones: 'No asignado',
          dueByTime: '19/11/2025 18:00',
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue(mockProblems),
      });

      const result = await repository.findAll();

      expect(result).toEqual(mockProblems);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no problems exist', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue([]),
      });

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });
  });

  describe('countAll', () => {
    it('should return count of all problems', async () => {
      const mockCount = [{ count: 42 }];
      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue(mockCount),
      });

      const result = await repository.countAll();

      expect(result).toBe(42);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no problems exist', async () => {
      const mockCount = [{ count: 0 }];
      mockDb.select.mockReturnValue({
        from: vi.fn().mockResolvedValue(mockCount),
      });

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
          subject: 'Test 1',
          subjectLink: 'https://sdp.belcorp.biz/WorkOrder.do?woID=131205',
          createdTime: '17/10/2025 11:34',
          aplicativos: 'Unete 3.0',
          createdBy: 'John Doe',
          planesDeAccion: 'Plan A',
          observaciones: 'Obs 1',
          dueByTime: '25/11/2025 11:34',
        },
        {
          requestId: 129476,
          serviceCategory: 'Problemas',
          subject: 'Test 2',
          createdTime: '10/10/2025 18:34',
          aplicativos: 'Somos Belcorp 2.0',
          createdBy: 'Jane Smith',
          planesDeAccion: 'No asignado',
          observaciones: 'No asignado',
          dueByTime: '19/11/2025 18:00',
        },
      ];

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      await repository.bulkCreate(records);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });

    it('should handle empty array gracefully', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      await repository.bulkCreate([]);

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAll', () => {
    it('should delete all problems and return count', async () => {
      const mockDeleted = [
        { requestId: 131205 },
        { requestId: 129476 },
        { requestId: 126953 },
      ];

      mockDb.delete.mockReturnValue({
        returning: vi.fn().mockResolvedValue(mockDeleted),
      });

      const result = await repository.deleteAll();

      expect(result).toBe(3);
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no problems exist to delete', async () => {
      mockDb.delete.mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      });

      const result = await repository.deleteAll();

      expect(result).toBe(0);
      expect(mockDb.delete).toHaveBeenCalledTimes(1);
    });
  });
});
