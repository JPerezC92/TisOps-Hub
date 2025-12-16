import { defineConfig } from 'vitest/config';
import { baseConfig } from './base';

/**
 * Vitest configuration for React and React Native applications
 * Note: Apps should add @vitejs/plugin-react in their own vitest.config.ts
 */
export const reactConfig = defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
});

export default reactConfig;
