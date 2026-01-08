import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';

// Concrete implementations for testing
class RequestTagAlreadyExistsTestError extends DomainError {
  readonly code = ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS;

  constructor(requestId: string) {
    super(`Request tag with ID '${requestId}' already exists`);
  }
}

class UnmappedDomainError extends DomainError {
  readonly code = 'UNMAPPED_ERROR_CODE';

  constructor() {
    super('This error code is not mapped');
  }
}

describe('DomainErrorFilter', () => {
  let filter: DomainErrorFilter;
  let mockResponse: {
    status: ReturnType<typeof createMockStatus>;
    json: ReturnType<typeof createMockJson>;
  };
  let mockHost: any;

  const createMockJson = () => {
    const fn = vi.fn();
    return fn;
  };

  const createMockStatus = (jsonFn: ReturnType<typeof createMockJson>) => {
    const fn = vi.fn().mockReturnValue({ json: jsonFn });
    return fn;
  };

  beforeEach(() => {
    filter = new DomainErrorFilter();

    const jsonFn = createMockJson();
    const statusFn = createMockStatus(jsonFn);

    mockResponse = {
      status: statusFn,
      json: jsonFn,
    };

    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    };
  });

  describe('catch', () => {
    describe('mapped error codes', () => {
      it('should return 409 Conflict for REQUEST_TAG_ALREADY_EXISTS', () => {
        const error = new RequestTagAlreadyExistsTestError('REQ001');

        filter.catch(error, mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      });

      it('should return JSend fail format for mapped errors', () => {
        const error = new RequestTagAlreadyExistsTestError('REQ001');

        filter.catch(error, mockHost);

        expect(mockResponse.json).toHaveBeenCalledWith({
          status: 'fail',
          data: {
            message: "Request tag with ID 'REQ001' already exists",
            code: ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS,
          },
        });
      });

      it('should include error code in response data', () => {
        const error = new RequestTagAlreadyExistsTestError('REQ002');

        filter.catch(error, mockHost);

        const jsonCall = mockResponse.json.mock.calls[0][0];
        expect(jsonCall.data.code).toBe(ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS);
      });

      it('should include error message in response data', () => {
        const error = new RequestTagAlreadyExistsTestError('REQ003');

        filter.catch(error, mockHost);

        const jsonCall = mockResponse.json.mock.calls[0][0];
        expect(jsonCall.data.message).toBe("Request tag with ID 'REQ003' already exists");
      });
    });

    describe('unmapped error codes', () => {
      it('should return 500 Internal Server Error for unmapped error codes', () => {
        const error = new UnmappedDomainError();

        filter.catch(error, mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it('should return JSend error format for unmapped errors', () => {
        const error = new UnmappedDomainError();

        filter.catch(error, mockHost);

        expect(mockResponse.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Domain error not mapped: UNMAPPED_ERROR_CODE',
        });
      });

      it('should include the unmapped error code in the message', () => {
        const error = new UnmappedDomainError();

        filter.catch(error, mockHost);

        const jsonCall = mockResponse.json.mock.calls[0][0];
        expect(jsonCall.message).toContain('UNMAPPED_ERROR_CODE');
      });
    });

    describe('host context', () => {
      it('should switch to HTTP context', () => {
        const error = new RequestTagAlreadyExistsTestError('REQ001');

        filter.catch(error, mockHost);

        expect(mockHost.switchToHttp).toHaveBeenCalled();
      });

      it('should get response from context', () => {
        const error = new RequestTagAlreadyExistsTestError('REQ001');

        filter.catch(error, mockHost);

        expect(mockHost.switchToHttp().getResponse).toHaveBeenCalled();
      });
    });
  });
});
