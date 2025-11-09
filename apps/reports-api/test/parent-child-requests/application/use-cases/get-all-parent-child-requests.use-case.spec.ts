import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/get-all-parent-child-requests.use-case';
import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { ParentChildRequestFactory } from '../../helpers/parent-child-request.factory';

describe('GetAllParentChildRequestsUseCase', () => {
  let getAllParentChildRequestsUseCase: GetAllParentChildRequestsUseCase;
  let mockRepository: MockProxy<IParentChildRequestRepository>;

  beforeEach(() => {
    mockRepository = mock<IParentChildRequestRepository>();
    getAllParentChildRequestsUseCase = new GetAllParentChildRequestsUseCase(
      mockRepository,
    );
  });

  it('should return all parent-child requests with default pagination', async () => {
    const expectedRequests = ParentChildRequestFactory.createMany(2);

    mockRepository.findAll.mockResolvedValue(expectedRequests);
    mockRepository.countAll.mockResolvedValue(2);

    const result = await getAllParentChildRequestsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledWith(50, 0);
    expect(mockRepository.countAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: expectedRequests, total: 2 });
  });

  it('should return parent-child requests with custom pagination', async () => {
    const expectedRequests = ParentChildRequestFactory.createMany(1);

    mockRepository.findAll.mockResolvedValue(expectedRequests);
    mockRepository.countAll.mockResolvedValue(100);

    const result = await getAllParentChildRequestsUseCase.execute(10, 20);

    expect(mockRepository.findAll).toHaveBeenCalledWith(10, 20);
    expect(mockRepository.countAll).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: expectedRequests, total: 100 });
  });

  it('should return empty array when no requests exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);
    mockRepository.countAll.mockResolvedValue(0);

    const result = await getAllParentChildRequestsUseCase.execute();

    expect(result).toEqual({ data: [], total: 0 });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);

    await expect(getAllParentChildRequestsUseCase.execute()).rejects.toThrow(
      'Database error',
    );
  });

  it('should call both findAll and countAll in parallel', async () => {
    const expectedRequests = ParentChildRequestFactory.createMany(1);

    mockRepository.findAll.mockResolvedValue(expectedRequests);
    mockRepository.countAll.mockResolvedValue(1);

    await getAllParentChildRequestsUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(mockRepository.countAll).toHaveBeenCalled();
  });
});
