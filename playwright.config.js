const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  // CI-specific optimizations:
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : '50%',  // Use half of available cores locally
  timeout: 60000, // Global test timeout
  
  // Reporting configuration
  reporter: process.env.CI ? [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['github']
  ] : [
    ['list'],
    ['html', { open: 'on-failure', outputFolder: 'playwright-report' }]
  ],

  use: {
    baseURL: 'https://www.saucedemo.com',
    
    // Artifacts configuration
    trace: process.env.CI ? 'on-first-retry' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    
    // Timeouts
    actionTimeout: 30000,      // Consider reducing these
    navigationTimeout: 45000,  // unless you have specific needs
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Optional: Add any browser launch options if needed
        // launchOptions: { 
        //   slowMo: process.env.CI ? 0 : 100 // Slow down for debugging locally
        // }
      },
    },
    // Uncomment other browsers as needed
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