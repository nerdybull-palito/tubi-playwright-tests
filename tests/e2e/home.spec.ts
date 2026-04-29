import { test, expect } from '../../fixtures/pages';
import { AccessibilityHelper } from '../../utils/accessibilityHelper';
import { TUBI_URLS, EXPECTED_META } from '../../utils/testData';


test.describe('Home Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateToHome();
  });

  // ─── Smoke Tests ─────────────────────────────────────────────────────────

  test('TC-HOME-001 | Should load the home page with correct title @smoke', async ({ homePage }) => {
    await homePage.assertPageTitle(EXPECTED_META.titlePattern);
    await homePage.assertURL(/tubitv\.com/);
  });


  test('TC-HOME-002 | Should display navigation bar @smoke', async ({ homePage }) => {
    await homePage.assertNavigationVisible();
    await homePage.assertVisible(homePage.logo, 'Tubi logo should be visible');
  });


  test('TC-HOME-003 | Should display content cards on the home page @smoke', async ({ homePage }) => {
    await homePage.assertContentCardsPresent();
  });

  
  // ─── Navigation ───────────────────────────────────────────────────────────


  test('TC-HOME-004 | Should have a working logo link that returns to home @regression', async ({ homePage, page }) => {
    // Navigate to search, then click logo 
    await page.goto(TUBI_URLS.search);
    await homePage.logo.click();
    await expect(page).toHaveURL(/tubitv\.com\/?$/);
  });

  // ---------- Need to fix ----------
  /*
  test('TC-HOME-005 | Should display auth buttons for unauthenticated users @regression', async ({ homePage }) => {
    await homePage.assertAuthButtonsPresent();
  });
  */

  // ---------- Need to fix ----------
  /*
  test('TC-HOME-006 | Should have working search icon @regression', async ({ homePage }) => {
    await homePage.assertSearchFunctional();
    await homePage.openSearch();
    await homePage.assertVisible(homePage.searchInput, 'Search input should appear after clicking search icon');
  });
  */


  // ─── Content Row Validation ────────────────────────────────────────────────


  test('TC-HOME-007 | Should display multiple content rows @regression', async ({ homePage }) => {
    const rowCount = await homePage.categoryRows.count();
    expect(rowCount, 'Should have multiple category rows').toBeGreaterThan(1);
  });

  // ---------- Need to get working ----------
  /*
  test('TC-HOME-008 | Should have clickable movie cards @regression', async ({ homePage, page }) => {
    const initialUrl = page.url();
    console.log(initialUrl);
    await homePage.clickFirstMovieCard();
    // Should navigate to a content detail page
    const newUrl = page.url();
    console.log(newUrl);
    await expect(page).not.toHaveURL(initialUrl);
  });
  */

  









});