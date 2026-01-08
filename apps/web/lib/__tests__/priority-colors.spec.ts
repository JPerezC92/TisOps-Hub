import { describe, it, expect } from 'vitest';
import { getPriorityColorClasses } from '@/lib/utils/priority-colors';

describe('getPriorityColorClasses', () => {
  it('should return red classes for Critical priority', () => {
    const result = getPriorityColorClasses('Critical');
    expect(result).toContain('bg-red-900');
    expect(result).toContain('text-red-200');
  });

  it('should return orange classes for High priority', () => {
    const result = getPriorityColorClasses('High');
    expect(result).toContain('bg-jpc-vibrant-orange');
    expect(result).toContain('text-jpc-vibrant-orange');
  });

  it('should return cyan classes for Medium priority', () => {
    const result = getPriorityColorClasses('Medium');
    expect(result).toContain('bg-jpc-vibrant-cyan');
    expect(result).toContain('text-cyan');
  });

  it('should return gray classes for Low priority', () => {
    const result = getPriorityColorClasses('Low');
    expect(result).toContain('bg-gray');
    expect(result).toContain('text-gray');
  });

  it('should return gray fallback classes for unknown priority', () => {
    const result = getPriorityColorClasses('Unknown');
    expect(result).toContain('bg-gray');
    expect(result).toContain('text-gray');
  });
});
