import { createTV } from 'tailwind-variants';

/**
 * Configured instance of tailwind-variants with custom settings
 * Use this instead of importing `tv` directly for consistent configuration
 */
export const tv = createTV({
  twMerge: true, // Enable automatic conflict resolution
  twMergeConfig: {
    // Add custom Tailwind config here if needed
  },
});

// Export the cn utility for manual class merging
export { cn } from 'tailwind-variants';
