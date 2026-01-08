import { describe, it, expect } from 'vitest';
import { DomainError } from '@shared/domain/errors/domain.error';

// Concrete implementation for testing
class TestDomainError extends DomainError {
  readonly code = 'TEST_ERROR';

  constructor(message: string) {
    super(message);
  }
}

class AnotherTestError extends DomainError {
  readonly code = 'ANOTHER_ERROR';

  constructor() {
    super('Another error message');
  }
}

describe('DomainError', () => {
  describe('constructor', () => {
    it('should set the error message', () => {
      const error = new TestDomainError('Test message');

      expect(error.message).toBe('Test message');
    });

    it('should set the error name to constructor name', () => {
      const error = new TestDomainError('Test message');

      expect(error.name).toBe('TestDomainError');
    });

    it('should set different names for different error classes', () => {
      const testError = new TestDomainError('Test');
      const anotherError = new AnotherTestError();

      expect(testError.name).toBe('TestDomainError');
      expect(anotherError.name).toBe('AnotherTestError');
    });

    it('should capture stack trace', () => {
      const error = new TestDomainError('Test message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TestDomainError');
    });

    it('should be an instance of Error', () => {
      const error = new TestDomainError('Test message');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be an instance of DomainError', () => {
      const error = new TestDomainError('Test message');

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('isDomainError', () => {
    it('should return true for DomainError instances', () => {
      const error = new TestDomainError('Test message');

      expect(DomainError.isDomainError(error)).toBe(true);
    });

    it('should return true for different DomainError subclasses', () => {
      const anotherError = new AnotherTestError();

      expect(DomainError.isDomainError(anotherError)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error');

      expect(DomainError.isDomainError(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(DomainError.isDomainError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(DomainError.isDomainError(undefined)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(DomainError.isDomainError('error message')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(DomainError.isDomainError(500)).toBe(false);
    });

    it('should return false for plain objects', () => {
      const obj = { message: 'error', code: 'TEST' };

      expect(DomainError.isDomainError(obj)).toBe(false);
    });

    it('should return false for objects that look like errors', () => {
      const fakeError = {
        message: 'Fake error',
        code: 'FAKE_ERROR',
        name: 'FakeError',
      };

      expect(DomainError.isDomainError(fakeError)).toBe(false);
    });
  });

  describe('code property', () => {
    it('should have a code property', () => {
      const error = new TestDomainError('Test message');

      expect(error.code).toBe('TEST_ERROR');
    });

    it('should have different codes for different error types', () => {
      const testError = new TestDomainError('Test');
      const anotherError = new AnotherTestError();

      expect(testError.code).toBe('TEST_ERROR');
      expect(anotherError.code).toBe('ANOTHER_ERROR');
    });
  });
});
