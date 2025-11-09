import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllRequestTagsUseCase } from '@request-tags/application/use-cases/get-all-request-tags.use-case';
import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';
import { RequestTagFactory } from '../../helpers/request-tag.factory';

describe('GetAllRequestTagsUseCase', () => {
  let getAllRequestTagsUseCase: GetAllRequestTagsUseCase;
  let mockRepository: MockProxy<IRequestTagRepository>;

  beforeEach(() => {
    mockRepository = mock<IRequestTagRepository>();
    getAllRequestTagsUseCase = new GetAllRequestTagsUseCase(mockRepository);
  });

  it('should return all request tags', async () => {
    const expectedTags = RequestTagFactory.createMany(5);

    mockRepository.findAll.mockResolvedValue(expectedTags);

    const result = await getAllRequestTagsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedTags);
    expect(result).toHaveLength(5);
  });

  it('should return empty array when no tags exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await getAllRequestTagsUseCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(getAllRequestTagsUseCase.execute()).rejects.toThrow(
      'Database error',
    );
  });

  it('should return tags with different categorization statuses', async () => {
    const tags = [
      RequestTagFactory.create({ categorizacion: 'Incident' }),
      RequestTagFactory.create({ categorizacion: 'Service Request' }),
      RequestTagFactory.create({ categorizacion: 'No asignado' }),
    ];

    mockRepository.findAll.mockResolvedValue(tags);

    const result = await getAllRequestTagsUseCase.execute();

    expect(result).toHaveLength(3);
    expect(result[0].categorizacion).toBe('Incident');
    expect(result[1].categorizacion).toBe('Service Request');
    expect(result[2].isCategorized()).toBe(false);
  });
});
