import path from 'path';
import { defineConfig } from '@playwright/test';

// Paths are built from this file's folder, so they work no matter where the config is loaded from.
const root = path.join(__dirname, '..');

export default defineConfig({
  testDir: path.join(root, 'tests'),
  outputDir: path.join(root, 'test-results'),
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.join(root, 'playwright-report') }],
    [path.join(root, 'ai/aiReporter.ts')],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
