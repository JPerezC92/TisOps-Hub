import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { ErrorLogRepository } from '@error-logs/infrastructure/repositories/error-log.repository';
import { ErrorLog } from '@error-logs/domain/entities/error-log.entity';

describe('ErrorLogRepository (Integration)', () => {
  let repository: ErrorLogRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new ErrorLogRepository(db);
  });

  describe('create()', () => {
    it('should persist an error log and return domain entity with generated id', async () => {
      const errorLog = new ErrorLog({
        timestamp: new Date(),
        errorType: 'ValidationError',
        errorMessage: 'Invalid input',
        stackTrace: 'Error: Invalid input\n  at ...',
        endpoint: '/api/tasks',
        method: 'POST',
      });

      const result = await repository.create(errorLog);

      expect(result.id).toBeDefined();
      expect(result.errorType).toBe('ValidationError');
      expect(result.errorMessage).toBe('Invalid input');
      expect(result.endpoint).toBe('/api/tasks');
      expect(result.method).toBe('POST');
    });

    it('should stringify metadata as JSON when provided', async () => {
      const metadata = { requestId: '123', userId: 'user-1' };
      const errorLog = new ErrorLog({
        timestamp: new Date(),
        errorType: 'DatabaseError',
        errorMessage: 'Connection failed',
        endpoint: '/api/reports',
        method: 'GET',
        metadata,
      });

      const result = await repository.create(errorLog);

      expect(result.id).toBeDefined();
      expect(result.metadata).toEqual(metadata);
    });

    it('should handle undefined metadata', async () => {
      const errorLog = new ErrorLog({
        timestamp: new Date(),
        errorType: 'UnknownError',
        errorMessage: 'Something went wrong',
        endpoint: '/api/test',
        method: 'DELETE',
      });

      const result = await repository.create(errorLog);

      expect(result.metadata).toBeUndefined();
    });
  });

  describe('findAll()', () => {
    it('should return error logs ordered by timestamp DESC', async () => {
      const earlier = new ErrorLog({ timestamp: new Date('2024-01-01'), errorType: 'Error', errorMessage: 'Earlier' });
      const later = new ErrorLog({ timestamp: new Date('2024-06-01'), errorType: 'Error', errorMessage: 'Later' });

      await repository.create(earlier);
      await repository.create(later);

      const results = await repository.findAll();

      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results[0].timestamp.getTime()).toBeGreaterThanOrEqual(results[1].timestamp.getTime());
    });

    it('should respect the limit parameter', async () => {
      const results = await repository.findAll(2);

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('findById()', () => {
    it('should return the error log matching the given id', async () => {
      const errorLog = new ErrorLog({ timestamp: new Date(), errorType: 'FindError', errorMessage: 'Find me', endpoint: '/find', method: 'GET' });
      const created = await repository.create(errorLog);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.errorType).toBe('FindError');
    });

    it('should return null when no error log matches the id', async () => {
      const result = await repository.findById(999999);

      expect(result).toBeNull();
    });
  });
});
