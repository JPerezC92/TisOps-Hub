import type { JSendFail, JSendError } from '@repo/reports/common';

/**
 * Extracts error message from JSend-compliant API responses.
 * Handles both fail (4xx) and error (5xx) response formats.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    // JSend fail format (4xx): { status: 'fail', data: { message, code } }
    if (
      'data' in error &&
      typeof (error as JSendFail<{ message: string }>).data?.message === 'string'
    ) {
      return (error as JSendFail<{ message: string }>).data.message;
    }
    // JSend error format (5xx): { status: 'error', message, code }
    if ('message' in error && typeof (error as JSendError).message === 'string') {
      return (error as JSendError).message;
    }
  }
  return 'An unexpected error occurred';
}
