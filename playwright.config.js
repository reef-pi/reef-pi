const { defineConfig } = require('@playwright/test')

const chromiumChannel = process.env.PLAYWRIGHT_CHROMIUM_CHANNEL

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
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        browserName: 'chromium',
        ...(chromiumChannel ? { channel: chromiumChannel } : {}),
        storageState: 'front-end/e2e/.auth/user.json'
      }
    }
  ]
})
