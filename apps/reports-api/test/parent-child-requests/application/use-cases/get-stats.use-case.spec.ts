import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { faker } from '@faker-js/faker';
import { GetStatsUseCase } from '@parent-child-requests/application/use-cases/get-stats.use-case';
import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';

describe('GetStatsUseCase', () => {
  let getStatsUseCase: GetStatsUseCase;
  let mockRepository: MockProxy<IParentChildRequestRepository>;

  beforeEach(() => {
    mockRepository = mock<IParentChildRequestRepository>();
    getStatsUseCase = new GetStatsUseCase(mockRepository);
  });

  it('should return statistics about parent-child requests', async () => {
    const expectedStats = {
      totalRecords: faker.number.int({ min: 1, max: 1000 }),
      uniqueParents: faker.number.int({ min: 1, max: 100 }),
      topParents: [
        {
          parentId: `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
          childCount: faker.number.int({ min: 1, max: 50 }),
          link: faker.internet.url(),
        },
        {
          parentId: `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
          childCount: faker.number.int({ min: 1, max: 50 }),
          link: null,
        },
      ],
    };

    mockRepository.getStats.mockResolvedValue(expectedStats);

    const result = await getStatsUseCase.execute();

    expect(mockRepository.getStats).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedStats);
  });

  it('should return stats with no top parents', async () => {
    const expectedStats = {
      totalRecords: 0,
      uniqueParents: 0,
      topParents: [],
    };

    mockRepository.getStats.mockResolvedValue(expectedStats);

    const result = await getStatsUseCase.execute();

    expect(result).toEqual(expectedStats);
    expect(result.topParents).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.getStats.mockRejectedValue(error);

    await expect(getStatsUseCase.execute()).rejects.toThrow('Database error');
  });

  it('should return stats with multiple top parents', async () => {
    const expectedStats = {
      totalRecords: 500,
      uniqueParents: 50,
      topParents: Array.from({ length: 10 }, () => ({
        parentId: `REQ${faker.string.alphanumeric(6).toUpperCase()}`,
        childCount: faker.number.int({ min: 1, max: 50 }),
        link: faker.datatype.boolean() ? faker.internet.url() : null,
      })),
    };

    mockRepository.getStats.mockResolvedValue(expectedStats);

    const result = await getStatsUseCase.execute();

    expect(result.topParents).toHaveLength(10);
    expect(result.totalRecords).toBe(500);
    expect(result.uniqueParents).toBe(50);
  });
});
