import { defineConfig } from 'vitest/config';
import { baseConfig } from './base';

/**
 * Vitest configuration for NestJS unit tests
 * Note: Apps should add unplugin-swc plugin in their own vitest.config.ts
 */
export const nestConfig = defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'node',
    root: '.',
    include: ['test/**/*.spec.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'test/**/*.e2e-spec.ts'],
    coverage: {
      ...baseConfig.test.coverage,
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});

/**
 * Vitest configuration for NestJS e2e tests
 * Note: Apps should add unplugin-swc plugin in their own vitest.config.ts
 */
export const nestE2EConfig = defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
  },
});

export default nestConfig;
