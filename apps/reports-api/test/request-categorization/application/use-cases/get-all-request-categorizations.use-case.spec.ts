import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/get-all-request-categorizations.use-case';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationFactory } from '../../helpers/request-categorization.factory';

describe('GetAllRequestCategorizationsUseCase', () => {
  let getAllUseCase: GetAllRequestCategorizationsUseCase;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestCategorizationRepository>();
    getAllUseCase = new GetAllRequestCategorizationsUseCase(mockRepository);
  });

  it('should return all request categorizations', async () => {
    const expectedCategorizations = RequestCategorizationFactory.createMany(3);

    mockRepository.findAll.mockResolvedValue(expectedCategorizations);

    const result = await getAllUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedCategorizations);
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no categorizations exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await getAllUseCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(getAllUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should return categorizations with different categories', async () => {
    const categorizations = [
      RequestCategorizationFactory.create({ category: 'Incident' }),
      RequestCategorizationFactory.create({ category: 'Service Request' }),
      RequestCategorizationFactory.create({ category: 'Change' }),
    ];

    mockRepository.findAll.mockResolvedValue(categorizations);

    const result = await getAllUseCase.execute();

    expect(result).toHaveLength(3);
    expect(result[0].getCategory()).toBe('Incident');
    expect(result[1].getCategory()).toBe('Service Request');
    expect(result[2].getCategory()).toBe('Change');
  });
});
