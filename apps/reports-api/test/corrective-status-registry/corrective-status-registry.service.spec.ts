import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CorrectiveStatusRegistryService } from '@corrective-status-registry/corrective-status-registry.service';
import { GetAllCorrectiveStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-all-corrective-statuses.use-case';
import { GetCorrectiveStatusByIdUseCase } from '@corrective-status-registry/application/use-cases/get-corrective-status-by-id.use-case';
import { CreateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/create-corrective-status.use-case';
import { UpdateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/update-corrective-status.use-case';
import { DeleteCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/delete-corrective-status.use-case';
import { GetDistinctDisplayStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-distinct-display-statuses.use-case';
import { CorrectiveStatusFactory } from './helpers/corrective-status.factory';

describe('CorrectiveStatusRegistryService', () => {
  let service: CorrectiveStatusRegistryService;
  let mockGetAllUseCase: MockProxy<GetAllCorrectiveStatusesUseCase>;
  let mockGetByIdUseCase: MockProxy<GetCorrectiveStatusByIdUseCase>;
  let mockCreateUseCase: MockProxy<CreateCorrectiveStatusUseCase>;
  let mockUpdateUseCase: MockProxy<UpdateCorrectiveStatusUseCase>;
  let mockDeleteUseCase: MockProxy<DeleteCorrectiveStatusUseCase>;
  let mockGetDistinctDisplayStatusesUseCase: MockProxy<GetDistinctDisplayStatusesUseCase>;

  beforeEach(() => {
    mockGetAllUseCase = mock<GetAllCorrectiveStatusesUseCase>();
    mockGetByIdUseCase = mock<GetCorrectiveStatusByIdUseCase>();
    mockCreateUseCase = mock<CreateCorrectiveStatusUseCase>();
    mockUpdateUseCase = mock<UpdateCorrectiveStatusUseCase>();
    mockDeleteUseCase = mock<DeleteCorrectiveStatusUseCase>();
    mockGetDistinctDisplayStatusesUseCase = mock<GetDistinctDisplayStatusesUseCase>();

    service = new CorrectiveStatusRegistryService(
      mockGetAllUseCase,
      mockGetByIdUseCase,
      mockCreateUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase,
      mockGetDistinctDisplayStatusesUseCase,
    );
  });

  describe('findAll', () => {
    it('should call getAllUseCase.execute', async () => {
      const mockStatuses = CorrectiveStatusFactory.createMany(3);

      mockGetAllUseCase.execute.mockResolvedValue(mockStatuses);

      const result = await service.findAll();

      expect(mockGetAllUseCase.execute).toHaveBeenCalledOnce();
      expect(result).toEqual(mockStatuses);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Database error');
      mockGetAllUseCase.execute.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should call getByIdUseCase.execute with correct id', async () => {
      const mockStatus = CorrectiveStatusFactory.create({ id: 1 });

      mockGetByIdUseCase.execute.mockResolvedValue(mockStatus);

      const result = await service.findById(1);

      expect(mockGetByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStatus);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Not found');
      mockGetByIdUseCase.execute.mockRejectedValue(error);

      await expect(service.findById(999)).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('should call createUseCase.execute with correct data', async () => {
      const createDto = {
        rawStatus: 'Dev in Progress',
        displayStatus: 'Development in Progress',
      };
      const mockStatus = CorrectiveStatusFactory.create({
        rawStatus: createDto.rawStatus,
        displayStatus: createDto.displayStatus,
      });

      mockCreateUseCase.execute.mockResolvedValue(mockStatus);

      const result = await service.create(createDto);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockStatus);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Create error');
      mockCreateUseCase.execute.mockRejectedValue(error);

      await expect(
        service.create({ rawStatus: 'Test', displayStatus: 'Test' }),
      ).rejects.toThrow('Create error');
    });
  });

  describe('update', () => {
    it('should call updateUseCase.execute with correct id and data', async () => {
      const updateDto = { displayStatus: 'Updated Status' };
      const mockStatus = CorrectiveStatusFactory.create({
        id: 1,
        displayStatus: 'Updated Status',
      });

      mockUpdateUseCase.execute.mockResolvedValue(mockStatus);

      const result = await service.update(1, updateDto);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockStatus);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Update error');
      mockUpdateUseCase.execute.mockRejectedValue(error);

      await expect(service.update(1, { displayStatus: 'Test' })).rejects.toThrow(
        'Update error',
      );
    });
  });

  describe('delete', () => {
    it('should call deleteUseCase.execute with correct id', async () => {
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      await service.delete(1);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Delete error');
      mockDeleteUseCase.execute.mockRejectedValue(error);

      await expect(service.delete(999)).rejects.toThrow('Delete error');
    });
  });

  describe('getDistinctDisplayStatuses', () => {
    it('should call getDistinctDisplayStatusesUseCase.execute', async () => {
      const mockStatuses = ['Development in Progress', 'In Backlog', 'In Testing'];

      mockGetDistinctDisplayStatusesUseCase.execute.mockResolvedValue(mockStatuses);

      const result = await service.getDistinctDisplayStatuses();

      expect(mockGetDistinctDisplayStatusesUseCase.execute).toHaveBeenCalledOnce();
      expect(result).toEqual(mockStatuses);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Fetch error');
      mockGetDistinctDisplayStatusesUseCase.execute.mockRejectedValue(error);

      await expect(service.getDistinctDisplayStatuses()).rejects.toThrow('Fetch error');
    });
  });
});
