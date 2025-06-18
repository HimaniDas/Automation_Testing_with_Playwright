const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  // CI-specific optimizations:
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,  // Reduced workers for stability
  //timeout: process.env.CI ? 300000 : 60000, // Longer timeout in CI
  
  // Enhanced reporting for CI
  reporter: process.env.CI ? [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['github']
  ] : 'html',

  use: {
    baseURL: 'https://www.saucedemo.com',
    
    // CI-optimized artifacts
    trace: process.env.CI ? 'on-first-retry' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    
    // Timeouts
    actionTimeout: 90000,
    navigationTimeout: 120000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // CI-specific viewport
        viewport: process.env.CI ? { width: 1280, height: 720 } : null
      },
    },
    /*{
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
*/
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});