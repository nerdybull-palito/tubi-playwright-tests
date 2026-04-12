import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { ContentPage } from '../pages/ContentPage';
import { AuthPage } from '../pages/AuthPage';
import { BrowsePage } from '../pages/BrowsePage';

export type TubiFixtures = {
  homePage: HomePage;
  searchPage: SearchPage;
  contentPage: ContentPage;
  authPage: AuthPage;
  browsePage: BrowsePage;
};

/**
 * Extended test fixture — all pages pre-constructed and available in every test.
 * Usage: import { test, expect } from '@fixtures/pages';
 */
export const test = base.extend<TubiFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
  contentPage: async ({ page }, use) => {
    await use(new ContentPage(page));
  },
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  browsePage: async ({ page }, use) => {
    await use(new BrowsePage(page));
  },
});

export { expect };