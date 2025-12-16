/**
 * Format a date string to a human-readable locale string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get Tailwind CSS classes for error type badge styling
 */
export function getErrorTypeColor(type: string): string {
  switch (type) {
    case 'DatabaseError':
      return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30';
    case 'ValidationError':
      return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/40 hover:bg-yellow-500/30';
    case 'NotFoundException':
      return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30';
    default:
      return 'bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30';
  }
}

/**
 * Get Tailwind CSS classes for HTTP method badge styling
 */
export function getMethodColor(method?: string): string {
  switch (method) {
    case 'GET':
      return 'bg-green-500/20 text-green-100 border-green-500/40 hover:bg-green-500/30';
    case 'POST':
      return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30';
    case 'PATCH':
    case 'PUT':
      return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/40 hover:bg-yellow-500/30';
    case 'DELETE':
      return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-100 border-gray-500/40 hover:bg-gray-500/30';
  }
}
