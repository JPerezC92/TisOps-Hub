import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteAllProblemsUseCase } from '@problems/application/use-cases/delete-all-problems.use-case';
import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';

describe('DeleteAllProblemsUseCase', () => {
  let useCase: DeleteAllProblemsUseCase;
  let mockRepository: IProblemsRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      countAll: vi.fn(),
      bulkCreate: vi.fn(),
      deleteAll: vi.fn(),
    };
    useCase = new DeleteAllProblemsUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should delete all problems and return count', async () => {
      vi.mocked(mockRepository.deleteAll).mockResolvedValue(50);

      const result = await useCase.execute();

      expect(result).toEqual({
        message: 'All problem records deleted successfully',
        deleted: 50,
      });
      expect(mockRepository.deleteAll).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion when no records exist', async () => {
      vi.mocked(mockRepository.deleteAll).mockResolvedValue(0);

      const result = await useCase.execute();

      expect(result).toEqual({
        message: 'All problem records deleted successfully',
        deleted: 0,
      });
      expect(mockRepository.deleteAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database deletion failed');
      vi.mocked(mockRepository.deleteAll).mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow('Database deletion failed');
      expect(mockRepository.deleteAll).toHaveBeenCalledTimes(1);
    });
  });
});
