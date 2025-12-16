import { DisplayStatus, type DisplayStatusValue } from '@repo/reports/frontend';

/**
 * Get Tailwind CSS classes for monthly report display status badge styling
 * Supports both DisplayStatus enum values and string values with spaces
 */
export function getDisplayStatusColor(displayStatus: DisplayStatusValue | string): string {
  switch (displayStatus) {
    case DisplayStatus.Closed:
    case 'Closed':
      return 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40';
    case DisplayStatus.OnGoingL2:
    case 'On going L2':
      return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40';
    case DisplayStatus.OnGoingL3:
    case 'On going L3':
      return 'bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40';
    case DisplayStatus.InL3Backlog:
    case 'In L3 Backlog':
      return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  }
}

/**
 * Get Tailwind CSS classes for corrective status badge styling
 */
export function getCorrectiveStatusColor(displayStatus: string): string {
  switch (displayStatus) {
    case 'In Backlog':
      return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40';
    case 'Dev in Progress':
      return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40';
    case 'In Testing':
      return 'bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40';
    case 'PRD Deployment':
      return 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  }
}
