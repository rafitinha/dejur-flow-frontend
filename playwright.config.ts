import { defineConfig, devices } from '@playwright/test';

import 'dotenv/config';

const appEnv = (process.env.APP_ENV ?? 'LOCAL').toUpperCase();
const isLocalEnv = appEnv === 'LOCAL';
const localChromeExecutablePath = process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH;

const chromiumProject =
  isLocalEnv && localChromeExecutablePath
    ? {
        name: 'chromium-local',
        use: {
          ...devices['Desktop Chrome'],
          executablePath: localChromeExecutablePath,
        },
      }
    : {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      };

export default defineConfig({
  testDir: './src/tests/e2e',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  projects: [chromiumProject],
});
