import { describe, it, expect } from 'vitest';
import { groupTickets, getStatusColor, formatDateTimeRange } from '@/modules/analytics-dashboard/utils';
import type { TicketDetail } from '@/modules/analytics-dashboard/types';

describe('groupTickets', () => {
  it('should group tickets by parentTicketId', () => {
    const tickets: TicketDetail[] = [
      {
        subject: 'Ticket A',
        requestId: 1,
        parentTicketId: 'PARENT-100',
        linkedTicketsCount: 3,
        additionalInfo: 'Info A',
        displayStatus: 'Open',
        isUnmapped: false,
      },
      {
        subject: 'Ticket B',
        requestId: 2,
        parentTicketId: 'PARENT-100',
        linkedTicketsCount: 3,
        additionalInfo: 'Info B',
        displayStatus: 'Open',
        isUnmapped: false,
      },
    ];

    const groups = groupTickets(tickets);

    expect(groups).toHaveLength(1);
    expect(groups[0]!.key).toBe('PARENT-100');
    expect(groups[0]!.count).toBe(2);
    expect(groups[0]!.requestIds).toHaveLength(2);
  });

  it('should group by displayStatus when no parent', () => {
    const tickets: TicketDetail[] = [
      {
        subject: 'Ticket A',
        requestId: 1,
        parentTicketId: 'No asignado',
        linkedTicketsCount: 0,
        additionalInfo: '',
        displayStatus: 'L2 Resolved',
        isUnmapped: false,
      },
      {
        subject: 'Ticket B',
        requestId: 2,
        parentTicketId: '0',
        linkedTicketsCount: 0,
        additionalInfo: '',
        displayStatus: 'L2 Resolved',
        isUnmapped: false,
      },
    ];

    const groups = groupTickets(tickets);

    expect(groups).toHaveLength(1);
    expect(groups[0]!.key).toBe('L2 Resolved');
    expect(groups[0]!.count).toBe(2);
  });

  it('should return empty array for empty input', () => {
    expect(groupTickets([])).toEqual([]);
  });
});

describe('getStatusColor', () => {
  it('should return emerald classes for closed', () => {
    expect(getStatusColor('Closed')).toContain('emerald');
  });

  it('should return orange classes for l3', () => {
    expect(getStatusColor('L3 - In Progress')).toContain('orange');
  });

  it('should return cyan classes for l2', () => {
    expect(getStatusColor('L2 Resolved')).toContain('cyan');
  });

  it('should return purple classes for l1', () => {
    expect(getStatusColor('L1 Support')).toContain('purple');
  });

  it('should return muted classes for unknown status', () => {
    expect(getStatusColor('Something Else')).toContain('muted');
  });
});

describe('formatDateTimeRange', () => {
  it('should format ISO strings into a readable range', () => {
    const result = formatDateTimeRange(
      '2025-01-15T00:00:00',
      '2025-01-15T14:30:00',
      '2025-01-15T16:00:00',
    );
    expect(result).toContain('Jan 15');
    expect(result).toContain('14h30');
    expect(result).toContain('16h00');
    expect(result).toContain('from');
    expect(result).toContain('to');
  });
});
