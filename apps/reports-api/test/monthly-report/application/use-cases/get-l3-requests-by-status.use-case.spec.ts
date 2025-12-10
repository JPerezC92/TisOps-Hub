import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { GetL3RequestsByStatusUseCase } from '@monthly-report/application/use-cases/get-l3-requests-by-status.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { MonthlyReportFactory } from '../../helpers/monthly-report.factory';

describe('GetL3RequestsByStatusUseCase', () => {
  let useCase: GetL3RequestsByStatusUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    useCase = new GetL3RequestsByStatusUseCase(mockRepository);
  });

  it('should return L3 requests by status without filters', async () => {
    const expectedResult = MonthlyReportFactory.createL3RequestsByStatusResult();

    mockRepository.findL3RequestsByStatus.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(mockRepository.findL3RequestsByStatus).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(expectedResult);
    expect(result).toHaveProperty('devInProgress');
    expect(result).toHaveProperty('inBacklog');
    expect(result).toHaveProperty('inTesting');
    expect(result).toHaveProperty('prdDeployment');
  });

  it('should return L3 requests by status filtered by app', async () => {
    const expectedResult = MonthlyReportFactory.createL3RequestsByStatusResult();

    mockRepository.findL3RequestsByStatus.mockResolvedValue(expectedResult);

    const result = await useCase.execute('FF');

    expect(mockRepository.findL3RequestsByStatus).toHaveBeenCalledWith('FF');
    expect(result).toEqual(expectedResult);
  });

  it('should return request details with correct structure', async () => {
    const expectedResult = MonthlyReportFactory.createL3RequestsByStatusResult();

    mockRepository.findL3RequestsByStatus.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    // Check structure of devInProgress requests
    result.devInProgress.forEach((request) => {
      expect(request).toHaveProperty('requestId');
      expect(request).toHaveProperty('createdTime');
      expect(request).toHaveProperty('modulo');
      expect(request).toHaveProperty('subject');
      expect(request).toHaveProperty('priority');
      expect(request).toHaveProperty('priorityEnglish');
      expect(request).toHaveProperty('linkedTicketsCount');
      expect(request).toHaveProperty('eta');
    });
  });

  it('should return arrays for all status categories', async () => {
    const expectedResult = MonthlyReportFactory.createL3RequestsByStatusResult();

    mockRepository.findL3RequestsByStatus.mockResolvedValue(expectedResult);

    const result = await useCase.execute();

    expect(Array.isArray(result.devInProgress)).toBe(true);
    expect(Array.isArray(result.inBacklog)).toBe(true);
    expect(Array.isArray(result.inTesting)).toBe(true);
    expect(Array.isArray(result.prdDeployment)).toBe(true);
  });
});
