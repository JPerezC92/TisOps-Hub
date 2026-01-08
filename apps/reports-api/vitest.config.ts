import { defineConfig, mergeConfig } from 'vitest/config';
import { nestConfig } from '@repo/vitest-config/nest';
import { resolve } from 'path';
import swc from 'unplugin-swc';

export default mergeConfig(
  nestConfig,
  defineConfig({
    plugins: [swc.vite()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, './src/shared'),
        '@tasks': resolve(__dirname, './src/tasks'),
        '@parent-child-requests': resolve(
          __dirname,
          './src/parent-child-requests',
        ),
        '@request-categorization': resolve(
          __dirname,
          './src/request-categorization',
        ),
        '@error-logs': resolve(__dirname, './src/error-logs'),
        '@request-tags': resolve(__dirname, './src/request-tags'),
        '@database': resolve(__dirname, './src/database'),
        '@common': resolve(__dirname, './src/common'),
        '@monthly-report': resolve(__dirname, './src/monthly-report'),
        '@sessions-orders': resolve(__dirname, './src/sessions-orders'),
        '@war-rooms': resolve(__dirname, './src/war-rooms'),
        '@weekly-corrective': resolve(__dirname, './src/weekly-corrective'),
        '@problems': resolve(__dirname, './src/problems'),
        '@application-registry': resolve(
          __dirname,
          './src/application-registry',
        ),
        '@monthly-report-status-registry': resolve(
          __dirname,
          './src/monthly-report-status-registry',
        ),
        '@corrective-status-registry': resolve(
          __dirname,
          './src/corrective-status-registry',
        ),
        '@categorization-registry': resolve(
          __dirname,
          './src/categorization-registry',
        ),
        '@module-registry': resolve(__dirname, './src/module-registry'),
        '@src': resolve(__dirname, './src'),
      },
    },
  }),
);
