import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@tasks': resolve(__dirname, './src/tasks'),
      '@parent-child-requests': resolve(__dirname, './src/parent-child-requests'),
      '@request-categorization': resolve(__dirname, './src/request-categorization'),
      '@error-logs': resolve(__dirname, './src/error-logs'),
      '@request-tags': resolve(__dirname, './src/request-tags'),
      '@database': resolve(__dirname, './src/database'),
      '@common': resolve(__dirname, './src/common'),
      '@monthly-report': resolve(__dirname, './src/monthly-report'),
      '@sessions-orders': resolve(__dirname, './src/sessions-orders'),
      '@war-rooms': resolve(__dirname, './src/war-rooms'),
      '@weekly-corrective': resolve(__dirname, './src/weekly-corrective'),
      '@problems': resolve(__dirname, './src/problems'),
      '@application-registry': resolve(__dirname, './src/application-registry'),
      '@monthly-report-status-registry': resolve(__dirname, './src/monthly-report-status-registry'),
      '@src': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
