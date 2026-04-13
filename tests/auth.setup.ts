// auth.setup.ts

// This will be used when using Credentials. You have to also uncomment each 
// dependencies: ['setup'], in playwright.config.ts files.

import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.TUBI_TEST_EMAIL!);
  await page.fill('input[type="password"]', process.env.TUBI_TEST_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL('/home');

  // Save session to disk — all other tests reuse this
  await page.context().storageState({ path: '.auth/user.json' });
});