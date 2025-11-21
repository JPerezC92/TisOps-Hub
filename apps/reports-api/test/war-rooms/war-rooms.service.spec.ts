import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { WarRoomsService } from '@war-rooms/war-rooms.service';
import { GetAllWarRoomsUseCase } from '@war-rooms/application/use-cases/get-all-war-rooms.use-case';
import { DeleteAllWarRoomsUseCase } from '@war-rooms/application/use-cases/delete-all-war-rooms.use-case';
import { UploadAndParseWarRoomsUseCase } from '@war-rooms/application/use-cases/upload-and-parse-war-rooms.use-case';
import { WarRoomsExcelParser } from '@war-rooms/infrastructure/parsers/war-rooms-excel.parser';
import { WarRoomsFactory } from './helpers/war-rooms.factory';

describe('WarRoomsService', () => {
  let service: WarRoomsService;
  let mockGetAllUseCase: MockProxy<GetAllWarRoomsUseCase>;
  let mockDeleteAllUseCase: MockProxy<DeleteAllWarRoomsUseCase>;
  let mockUploadAndParseUseCase: MockProxy<UploadAndParseWarRoomsUseCase>;
  let mockExcelParser: MockProxy<WarRoomsExcelParser>;

  beforeEach(() => {
    mockGetAllUseCase = mock<GetAllWarRoomsUseCase>();
    mockDeleteAllUseCase = mock<DeleteAllWarRoomsUseCase>();
    mockUploadAndParseUseCase = mock<UploadAndParseWarRoomsUseCase>();
    mockExcelParser = mock<WarRoomsExcelParser>();

    service = new WarRoomsService(
      mockGetAllUseCase,
      mockDeleteAllUseCase,
      mockUploadAndParseUseCase,
      mockExcelParser,
    );
  });

  describe('findAll', () => {
    it('should call getAllUseCase.execute', async () => {
      const mockResponse = WarRoomsFactory.createFindAllResponse({ count: 5 });

      mockGetAllUseCase.execute.mockResolvedValue(mockResponse);

      const result = await service.findAll();

      expect(mockGetAllUseCase.execute).toHaveBeenCalledOnce();
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Database error');
      mockGetAllUseCase.execute.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('getAnalytics', () => {
    it('should call getAllUseCase.executeWithFilters with app parameter', async () => {
      const mockResponse = WarRoomsFactory.createAnalyticsResponse({
        count: 3,
        app: { id: 1, code: 'FFVV', name: 'FFVV Application' },
      });

      mockGetAllUseCase.executeWithFilters.mockResolvedValue(mockResponse);

      const result = await service.getAnalytics('FFVV', undefined);

      expect(mockGetAllUseCase.executeWithFilters).toHaveBeenCalledWith('FFVV', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call getAllUseCase.executeWithFilters with month parameter', async () => {
      const mockResponse = WarRoomsFactory.createAnalyticsResponse({ count: 5 });

      mockGetAllUseCase.executeWithFilters.mockResolvedValue(mockResponse);

      const result = await service.getAnalytics(undefined, '2025-01');

      expect(mockGetAllUseCase.executeWithFilters).toHaveBeenCalledWith(undefined, '2025-01');
      expect(result).toEqual(mockResponse);
    });

    it('should call getAllUseCase.executeWithFilters with both parameters', async () => {
      const mockResponse = WarRoomsFactory.createAnalyticsResponse({
        count: 2,
        app: { id: 2, code: 'B2B', name: 'B2B Application' },
      });

      mockGetAllUseCase.executeWithFilters.mockResolvedValue(mockResponse);

      const result = await service.getAnalytics('B2B', '2025-02');

      expect(mockGetAllUseCase.executeWithFilters).toHaveBeenCalledWith('B2B', '2025-02');
      expect(result).toEqual(mockResponse);
    });

    it('should call getAllUseCase.executeWithFilters with no parameters', async () => {
      const mockResponse = WarRoomsFactory.createAnalyticsResponse({ count: 10 });

      mockGetAllUseCase.executeWithFilters.mockResolvedValue(mockResponse);

      const result = await service.getAnalytics(undefined, undefined);

      expect(mockGetAllUseCase.executeWithFilters).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Filter error');
      mockGetAllUseCase.executeWithFilters.mockRejectedValue(error);

      await expect(service.getAnalytics('FFVV', '2025-01')).rejects.toThrow('Filter error');
    });

    it('should return empty result when no matches found', async () => {
      const mockResponse = { data: [], total: 0 };

      mockGetAllUseCase.executeWithFilters.mockResolvedValue(mockResponse);

      const result = await service.getAnalytics('UNKNOWN', '2025-12');

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('deleteAll', () => {
    it('should call deleteAllUseCase.execute', async () => {
      const mockResponse = WarRoomsFactory.createDeleteResponse({ deleted: 50 });

      mockDeleteAllUseCase.execute.mockResolvedValue(mockResponse);

      const result = await service.deleteAll();

      expect(mockDeleteAllUseCase.execute).toHaveBeenCalledOnce();
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Delete error');
      mockDeleteAllUseCase.execute.mockRejectedValue(error);

      await expect(service.deleteAll()).rejects.toThrow('Delete error');
    });
  });

  describe('uploadAndParse', () => {
    it('should call uploadAndParseUseCase.execute with parsed records', async () => {
      const mockBuffer = Buffer.from('test');
      const mockParsedRecords = WarRoomsFactory.createManyWarRooms(5);
      const mockResponse = WarRoomsFactory.createUploadResponse({
        imported: 100,
        total: 100,
      });

      mockExcelParser.parse.mockReturnValue(mockParsedRecords);
      mockUploadAndParseUseCase.execute.mockResolvedValue(mockResponse);

      const result = await service.uploadAndParse(mockBuffer);

      expect(mockExcelParser.parse).toHaveBeenCalledWith(mockBuffer);
      expect(mockUploadAndParseUseCase.execute).toHaveBeenCalledWith(mockParsedRecords);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from use case', async () => {
      const mockBuffer = Buffer.from('test');
      const mockParsedRecords = WarRoomsFactory.createManyWarRooms(5);
      const error = new Error('Parse error');

      mockExcelParser.parse.mockReturnValue(mockParsedRecords);
      mockUploadAndParseUseCase.execute.mockRejectedValue(error);

      await expect(service.uploadAndParse(mockBuffer)).rejects.toThrow('Failed to process file: Parse error');
    });
  });
});
