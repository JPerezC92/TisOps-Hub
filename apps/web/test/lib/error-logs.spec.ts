import { describe, it, expect } from 'vitest';
import { formatDate, getErrorTypeColor, getMethodColor } from '@/lib/utils/error-logs';

describe('formatDate', () => {
  it('should format ISO date string correctly', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });

  it('should handle date with time components', () => {
    const result = formatDate('2024-06-20T14:45:30Z');
    expect(result).toContain('Jun');
    expect(result).toContain('20');
  });
});

describe('getErrorTypeColor', () => {
  it('should return orange classes for DatabaseError', () => {
    const result = getErrorTypeColor('DatabaseError');
    expect(result).toContain('bg-jpc-vibrant-orange');
    expect(result).toContain('text-jpc-vibrant-orange');
  });

  it('should return yellow classes for ValidationError', () => {
    const result = getErrorTypeColor('ValidationError');
    expect(result).toContain('bg-yellow');
    expect(result).toContain('text-yellow');
  });

  it('should return cyan classes for NotFoundException', () => {
    const result = getErrorTypeColor('NotFoundException');
    expect(result).toContain('bg-jpc-vibrant-cyan');
    expect(result).toContain('text-jpc-vibrant-cyan');
  });

  it('should return purple classes for unknown error type', () => {
    const result = getErrorTypeColor('UnknownError');
    expect(result).toContain('bg-jpc-vibrant-purple');
    expect(result).toContain('text-jpc-vibrant-purple');
  });
});

describe('getMethodColor', () => {
  it('should return green classes for GET method', () => {
    const result = getMethodColor('GET');
    expect(result).toContain('bg-green');
    expect(result).toContain('text-green');
  });

  it('should return cyan classes for POST method', () => {
    const result = getMethodColor('POST');
    expect(result).toContain('bg-jpc-vibrant-cyan');
    expect(result).toContain('text-jpc-vibrant-cyan');
  });

  it('should return yellow classes for PATCH method', () => {
    const result = getMethodColor('PATCH');
    expect(result).toContain('bg-yellow');
    expect(result).toContain('text-yellow');
  });

  it('should return yellow classes for PUT method', () => {
    const result = getMethodColor('PUT');
    expect(result).toContain('bg-yellow');
    expect(result).toContain('text-yellow');
  });

  it('should return orange classes for DELETE method', () => {
    const result = getMethodColor('DELETE');
    expect(result).toContain('bg-jpc-vibrant-orange');
    expect(result).toContain('text-jpc-vibrant-orange');
  });

  it('should return gray classes for undefined method', () => {
    const result = getMethodColor(undefined);
    expect(result).toContain('bg-gray');
    expect(result).toContain('text-gray');
  });

  it('should return gray classes for unknown method', () => {
    const result = getMethodColor('OPTIONS');
    expect(result).toContain('bg-gray');
    expect(result).toContain('text-gray');
  });
});
