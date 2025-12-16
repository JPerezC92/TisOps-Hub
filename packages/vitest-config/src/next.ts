import { defineConfig } from 'vitest/config';
import { baseConfig } from './base';

/**
 * Vitest configuration for Next.js applications
 * Note: Apps should add @vitejs/plugin-react in their own vitest.config.ts
 */
export const nextConfig = defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
  },
});

export default nextConfig;
