import { defineConfig } from 'vitest/config';

export const baseConfig = {
  test: {
    globals: true,
    coverage: {
      provider: 'v8' as 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
    },
  },
};

export default defineConfig(baseConfig);
