import { DateTime } from 'luxon';
import type { TicketDetail, TicketGroup } from '@/modules/analytics-dashboard/types';

/** Group tickets by parentTicketId (if exists) or displayStatus */
export function groupTickets(tickets: TicketDetail[]): TicketGroup[] {
  const groups = new Map<string, TicketGroup>();

  for (const ticket of tickets) {
    const hasParent = ticket.parentTicketId && ticket.parentTicketId !== 'No asignado' && ticket.parentTicketId !== '0';
    const key = hasParent ? ticket.parentTicketId : ticket.displayStatus;

    if (groups.has(key)) {
      const group = groups.get(key)!;
      group.count++;
      group.requestIds.push({ requestId: ticket.requestId, requestIdLink: ticket.requestIdLink });
    } else {
      groups.set(key, {
        key,
        count: 1,
        requestIds: [{ requestId: ticket.requestId, requestIdLink: ticket.requestIdLink }],
        parentTicketId: ticket.parentTicketId,
        linkedTicketsCount: ticket.linkedTicketsCount,
        additionalInfo: ticket.additionalInfo,
        displayStatus: ticket.displayStatus,
        isUnmapped: ticket.isUnmapped,
      });
    }
  }

  return Array.from(groups.values());
}

/** Get default date range: Last Friday to Last Thursday */
export function getDefaultDateRange() {
  const today = DateTime.now();
  let lastThursday = today.set({ weekday: 4 });
  if (lastThursday >= today) {
    lastThursday = lastThursday.minus({ weeks: 1 });
  }
  const lastFriday = lastThursday.minus({ days: 6 });
  return {
    startDate: lastFriday.toFormat('yyyy-MM-dd'),
    endDate: lastThursday.toFormat('yyyy-MM-dd'),
  };
}

/** Format a timestamp or ISO string to short date (e.g., "Nov 4") */
export function formatDate(timestamp: number | string): string {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'string'
    ? DateTime.fromISO(timestamp)
    : DateTime.fromMillis(timestamp);
  return date.toFormat('MMM d');
}

/** Format a timestamp or ISO string to time (e.g., "14h30") */
export function formatTime(timestamp: number | string): string {
  if (!timestamp) return 'N/A';
  const time = typeof timestamp === 'string'
    ? DateTime.fromISO(timestamp)
    : DateTime.fromMillis(timestamp);
  return time.toFormat("HH'h'mm");
}

/** Format a date + start/end time into a range string */
export function formatDateTimeRange(date: number | string, startTime: number | string, endTime: number | string): string {
  const dateStr = formatDate(date);
  const startStr = formatTime(startTime);
  const endStr = formatTime(endTime);
  return `${dateStr} from ${startStr} to ${endStr}`;
}

/** Get war room status badge color classes */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('closed')) return 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-500 border-jpc-vibrant-emerald-500/30';
  if (statusLower.includes('l3')) return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-500 border-jpc-vibrant-orange-500/30';
  if (statusLower.includes('l2')) return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-500 border-jpc-vibrant-cyan-500/30';
  if (statusLower.includes('l1')) return 'bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-500 border-jpc-vibrant-purple-500/30';
  return 'bg-muted text-muted-foreground border-border';
}
