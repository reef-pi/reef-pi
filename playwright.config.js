const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './front-end/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  outputDir: 'test-results/playwright',
  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'make start-dev',
    url: 'http://127.0.0.1:8080/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/
    },
    {
      name: 'smoke-chromium',
      dependencies: ['setup'],
      testMatch: /specs\/(auth-and-shell|dashboard-and-responsive|seeded-configuration|full-smoke-coverage)\.spec\.js/,
      use: {
        browserName: 'chromium',
        storageState: 'front-end/e2e/.auth/user.json'
      }
    },
    {
      name: 'ui-audit-chromium',
      dependencies: ['setup'],
      testMatch: /specs\/ui-audit\/.*\.spec\.js/,
      outputDir: 'test-results/ui-audit/playwright',
      use: {
        browserName: 'chromium',
        storageState: 'front-end/e2e/.auth/user.json',
        viewport: { width: 1440, height: 1000 }
      }
    },
    {
      name: 'integration-chromium',
      dependencies: ['setup'],
      testMatch: /specs\/integration\/.*\.spec\.js/,
      timeout: 180000,
      use: {
        browserName: 'chromium',
        storageState: 'front-end/e2e/.auth/user.json'
      }
    }
  ]
})
