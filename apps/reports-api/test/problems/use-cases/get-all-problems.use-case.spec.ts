import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetAllProblemsUseCase } from '@problems/application/use-cases/get-all-problems.use-case';
import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';
import type { Problem } from '@repo/database';

describe('GetAllProblemsUseCase', () => {
  let useCase: GetAllProblemsUseCase;
  let mockRepository: IProblemsRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      countAll: vi.fn(),
      bulkCreate: vi.fn(),
      deleteAll: vi.fn(),
    };
    useCase = new GetAllProblemsUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return all problems from repository', async () => {
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
          aplicativos: 'Unete 3.0',
          createdBy: 'Jane Smith',
          planesDeAccion: 'No asignado',
          observaciones: 'No asignado',
          dueByTime: '19/11/2025 18:00',
        },
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockProblems);
      vi.mocked(mockRepository.countAll).mockResolvedValue(2);

      const result = await useCase.execute();

      expect(result).toEqual({
        data: mockProblems,
        total: 2,
      });
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.countAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no problems exist', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([]);
      vi.mocked(mockRepository.countAll).mockResolvedValue(0);

      const result = await useCase.execute();

      expect(result).toEqual({
        data: [],
        total: 0,
      });
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.countAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(mockRepository.findAll).mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow('Database connection failed');
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
