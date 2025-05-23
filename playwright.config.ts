import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd frontendchallengeserver && node index.js',
      url: 'http://localhost:3000/api/v1/mockorg/actions/blueprints/mockblueprint/graph',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'Server is running on http://localhost:3000',
      stderr: 'error',
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3003',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'Local:',
      stderr: 'error',
    }
  ],
  timeout: 60000,
}); 