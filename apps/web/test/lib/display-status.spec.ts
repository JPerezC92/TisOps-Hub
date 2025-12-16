import { describe, it, expect } from 'vitest';
import { getDisplayStatusColor, getCorrectiveStatusColor } from '@/lib/utils/display-status';

describe('getDisplayStatusColor', () => {
  it('should return emerald classes for Closed status', () => {
    const result = getDisplayStatusColor('Closed');
    expect(result).toContain('bg-jpc-vibrant-emerald');
    expect(result).toContain('text-jpc-vibrant-emerald');
  });

  it('should return cyan classes for On going L2 status', () => {
    const result = getDisplayStatusColor('On going L2');
    expect(result).toContain('bg-jpc-vibrant-cyan');
    expect(result).toContain('text-jpc-vibrant-cyan');
  });

  it('should return purple classes for On going L3 status', () => {
    const result = getDisplayStatusColor('On going L3');
    expect(result).toContain('bg-jpc-vibrant-purple');
    expect(result).toContain('text-jpc-vibrant-purple');
  });

  it('should return orange classes for In L3 Backlog status', () => {
    const result = getDisplayStatusColor('In L3 Backlog');
    expect(result).toContain('bg-jpc-vibrant-orange');
    expect(result).toContain('text-jpc-vibrant-orange');
  });

  it('should return gray fallback for unknown status', () => {
    const result = getDisplayStatusColor('Unknown');
    expect(result).toContain('bg-gray');
    expect(result).toContain('text-gray');
  });
});

describe('getCorrectiveStatusColor', () => {
  it('should return orange classes for In Backlog status', () => {
    const result = getCorrectiveStatusColor('In Backlog');
    expect(result).toContain('bg-jpc-vibrant-orange');
    expect(result).toContain('text-jpc-vibrant-orange');
  });

  it('should return cyan classes for Dev in Progress status', () => {
    const result = getCorrectiveStatusColor('Dev in Progress');
    expect(result).toContain('bg-jpc-vibrant-cyan');
    expect(result).toContain('text-jpc-vibrant-cyan');
  });

  it('should return purple classes for In Testing status', () => {
    const result = getCorrectiveStatusColor('In Testing');
    expect(result).toContain('bg-jpc-vibrant-purple');
    expect(result).toContain('text-jpc-vibrant-purple');
  });

  it('should return emerald classes for PRD Deployment status', () => {
    const result = getCorrectiveStatusColor('PRD Deployment');
    expect(result).toContain('bg-jpc-vibrant-emerald');
    expect(result).toContain('text-jpc-vibrant-emerald');
  });

  it('should return gray fallback for unknown status', () => {
    const result = getCorrectiveStatusColor('Unknown');
    expect(result).toContain('bg-gray');
    expect(result).toContain('text-gray');
  });
});
