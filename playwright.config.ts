import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL || 'https://tubitv.com';
const CI = !!process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    },
  },

  reporter: CI
    ? [
        ['github'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: BASE_URL,
    trace: CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: CI ? 'retain-on-failure' : 'off',
    // storageState: '.auth/user.json', // uncomment this line when using Credentials
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: false,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
    geolocation: { longitude: -118.2437, latitude: 34.0522 }, // LA - Tubi HQ
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    permissions: ['geolocation'],
  },

  /* Configure projects for major browsers */
  projects: [
    // ─── Setup ────────────────────────────────────────────────────────────────
    // Uncomment Setup project and dependencies: ['setup'], when using Credentials again
    /*{
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    }, */
 
    // ─── Desktop Browsers ─────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      //dependencies: ['setup'],
    },
/*   {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      //dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      //dependencies: ['setup'],
    },
 
    // ─── Mobile Devices ───────────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      //dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
      //dependencies: ['setup'],
    },

    // ─── Smoke Suite (CI fast lane) ───────────────────────────────────────────
    {
      name: 'smoke',
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
    },
    */
  ],

  outputDir: 'test-results',
  preserveOutput: 'failures-only',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
