import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CreateManyRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/create-many-request-categorizations.use-case';
import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationFactory } from '../../helpers/request-categorization.factory';

describe('CreateManyRequestCategorizationsUseCase', () => {
  let createManyUseCase: CreateManyRequestCategorizationsUseCase;
  let mockRepository: MockProxy<IRequestCategorizationRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestCategorizationRepository>();
    createManyUseCase = new CreateManyRequestCategorizationsUseCase(
      mockRepository,
    );
  });

  it('should create multiple request categorizations', async () => {
    const entities = RequestCategorizationFactory.createMany(3);

    mockRepository.createMany.mockResolvedValue(entities);

    const result = await createManyUseCase.execute(entities);

    expect(mockRepository.createMany).toHaveBeenCalledWith(entities);
    expect(mockRepository.createMany).toHaveBeenCalledOnce();
    expect(result).toEqual(entities);
    expect(result).toHaveLength(3);
  });

  it('should handle empty array', async () => {
    mockRepository.createMany.mockResolvedValue([]);

    const result = await createManyUseCase.execute([]);

    expect(mockRepository.createMany).toHaveBeenCalledWith([]);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const entities = RequestCategorizationFactory.createMany(3);
    const error = new Error('Database error');

    mockRepository.createMany.mockRejectedValue(error);

    await expect(createManyUseCase.execute(entities)).rejects.toThrow(
      'Database error',
    );
  });

  it('should create single entity', async () => {
    const entity = RequestCategorizationFactory.create();

    mockRepository.createMany.mockResolvedValue([entity]);

    const result = await createManyUseCase.execute([entity]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(entity);
  });

  it('should create many entities with different categories', async () => {
    const entities = [
      RequestCategorizationFactory.create({ category: 'Incident' }),
      RequestCategorizationFactory.create({ category: 'Service Request' }),
      RequestCategorizationFactory.create({ category: 'Change' }),
    ];

    mockRepository.createMany.mockResolvedValue(entities);

    const result = await createManyUseCase.execute(entities);

    expect(result).toHaveLength(3);
    expect(result[0].getCategory()).toBe('Incident');
    expect(result[1].getCategory()).toBe('Service Request');
    expect(result[2].getCategory()).toBe('Change');
  });
});
