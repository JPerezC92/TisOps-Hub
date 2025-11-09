import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { UpsertManyRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/upsert-many-request-categorizations.use-case';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationFactory } from '../../helpers/request-categorization.factory';

describe('UpsertManyRequestCategorizationsUseCase', () => {
  let upsertManyUseCase: UpsertManyRequestCategorizationsUseCase;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestCategorizationRepository>();
    upsertManyUseCase = new UpsertManyRequestCategorizationsUseCase(
      mockRepository,
    );
  });

  it('should create new records when they do not exist', async () => {
    const entities = RequestCategorizationFactory.createMany(5);
    const expectedResult = { created: 5, updated: 0 };

    mockRepository.upsertMany.mockResolvedValue(expectedResult);

    const result = await upsertManyUseCase.execute(entities);

    expect(mockRepository.upsertMany).toHaveBeenCalledWith(entities);
    expect(mockRepository.upsertMany).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedResult);
    expect(result.created).toBe(5);
    expect(result.updated).toBe(0);
  });

  it('should update existing records', async () => {
    const entities = RequestCategorizationFactory.createMany(3);
    const expectedResult = { created: 0, updated: 3 };

    mockRepository.upsertMany.mockResolvedValue(expectedResult);

    const result = await upsertManyUseCase.execute(entities);

    expect(result).toEqual(expectedResult);
    expect(result.created).toBe(0);
    expect(result.updated).toBe(3);
  });

  it('should handle mix of create and update operations', async () => {
    const entities = RequestCategorizationFactory.createMany(10);
    const expectedResult = { created: 6, updated: 4 };

    mockRepository.upsertMany.mockResolvedValue(expectedResult);

    const result = await upsertManyUseCase.execute(entities);

    expect(result).toEqual(expectedResult);
    expect(result.created).toBe(6);
    expect(result.updated).toBe(4);
  });

  it('should handle empty array', async () => {
    const expectedResult = { created: 0, updated: 0 };

    mockRepository.upsertMany.mockResolvedValue(expectedResult);

    const result = await upsertManyUseCase.execute([]);

    expect(mockRepository.upsertMany).toHaveBeenCalledWith([]);
    expect(result).toEqual(expectedResult);
  });

  it('should handle repository errors', async () => {
    const entities = RequestCategorizationFactory.createMany(3);
    const error = new Error('Database error');

    mockRepository.upsertMany.mockRejectedValue(error);

    await expect(upsertManyUseCase.execute(entities)).rejects.toThrow(
      'Database error',
    );
  });

  it('should upsert single entity', async () => {
    const entity = RequestCategorizationFactory.create();
    const expectedResult = { created: 1, updated: 0 };

    mockRepository.upsertMany.mockResolvedValue(expectedResult);

    const result = await upsertManyUseCase.execute([entity]);

    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
  });

  it('should return correct counts for large batch', async () => {
    const entities = RequestCategorizationFactory.createMany(100);
    const expectedResult = { created: 75, updated: 25 };

    mockRepository.upsertMany.mockResolvedValue(expectedResult);

    const result = await upsertManyUseCase.execute(entities);

    expect(result.created + result.updated).toBe(100);
    expect(result.created).toBe(75);
    expect(result.updated).toBe(25);
  });
});
