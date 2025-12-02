import { Priority } from '@repo/reports/frontend';

/**
 * Returns Tailwind CSS classes for priority-based badge styling
 * @param priority - Priority value (Low, Medium, High, Critical)
 * @returns Tailwind CSS class string for Badge component
 */
export function getPriorityColorClasses(priority: string): string {
  switch (priority) {
    case Priority.Critical:
      return 'bg-red-900/30 text-red-200 border-red-700/50 hover:bg-red-900/40';
    case Priority.High:
      return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30';
    case Priority.Medium:
      return 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30';
    case Priority.Low:
      return 'bg-gray-500/20 text-gray-100 border-gray-500/40 hover:bg-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-100 border-gray-500/40';
  }
}
