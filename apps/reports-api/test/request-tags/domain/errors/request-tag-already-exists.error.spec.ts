import { describe, it, expect } from 'vitest';
import { RequestTagAlreadyExistsError } from '@request-tags/domain/errors/request-tag-already-exists.error';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';

describe('RequestTagAlreadyExistsError', () => {
  describe('constructor', () => {
    it('should create an error with the correct message', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error.message).toBe("Request tag with ID 'REQ001' already exists");
    });

    it('should interpolate the requestId into the message', () => {
      const error = new RequestTagAlreadyExistsError('ABC-123-XYZ');

      expect(error.message).toContain('ABC-123-XYZ');
    });

    it('should store the requestId property', () => {
      const error = new RequestTagAlreadyExistsError('REQ002');

      expect(error.requestId).toBe('REQ002');
    });
  });

  describe('error code', () => {
    it('should have the correct error code', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error.code).toBe(ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS);
    });

    it('should have code equal to REQUEST_TAG_ALREADY_EXISTS string', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error.code).toBe('REQUEST_TAG_ALREADY_EXISTS');
    });
  });

  describe('inheritance', () => {
    it('should be an instance of DomainError', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error).toBeInstanceOf(DomainError);
    });

    it('should be an instance of Error', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error).toBeInstanceOf(Error);
    });

    it('should pass DomainError.isDomainError check', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(DomainError.isDomainError(error)).toBe(true);
    });
  });

  describe('error name', () => {
    it('should have the correct error name', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error.name).toBe('RequestTagAlreadyExistsError');
    });
  });

  describe('stack trace', () => {
    it('should have a stack trace', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error.stack).toBeDefined();
    });

    it('should include the error name in stack trace', () => {
      const error = new RequestTagAlreadyExistsError('REQ001');

      expect(error.stack).toContain('RequestTagAlreadyExistsError');
    });
  });
});
