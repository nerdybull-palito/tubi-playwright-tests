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

  test('TC-HOME-009 | Should have genre/category link @regression', async ({ homePage }) => {
    const links = await homePage.getGenreLinks();
    expect(links.length, 'Should have genre links').toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link, 'Genre links should be absolute URLs').toMatch(/^https?:\/\//);
    });
  });

  // ─── Meta & SEO ────────────────────────────────────────────────────────────

  test('TC-HOME-010 | Should have proper meta description @regression', async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute('content');
    expect(content, 'Meta description should be present').toBeTruthy();
    expect(content!.length, 'Meta description should be meaningful').toBeGreaterThan(20);
  });


  test('TC-HOME-011 | Should have proper Open Graph tags @regression', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogImage = page.locator('meta[property="og:image"]');
    expect(await ogTitle.getAttribute('content'), 'OG title should be set').toBeTruthy();
    expect(await ogImage.getAttribute('content'), 'OG image should be set').toBeTruthy();
  })

  // ─── Performance ───────────────────────────────────────────────────────────

  test('TC-HOME-012 | Should load within acceptable time @regression', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    // console.log(loadTime);
    expect(loadTime, 'Page should load within 5 seconds (took ${loadTime}ms)').toBeLessThan(5_000);
  });

  
  // ─── Accessibility ─────────────────────────────────────────────────────────

  // ---------- Need to get working ----------
  /*
  test('TC-HOME-013 | Should meet basic accessiblity standards @regression', async ({ page }) => {
    const a11y = new AccessibilityHelper(page);
    await a11y.assertHtmlLangPresent();
    await a11y.assertLandmarksPresent();
    await a11y.assertNoEmptyButtons();
  });
  */


  test('TC-HOME-014 | Should have images with alt text @regression', async ({ page }) => {
    const a11y = new AccessibilityHelper(page);
    await a11y.assertImagesHaveAltText();
  });


  // ─── Responsive Layout ─────────────────────────────────────────────────────


  test('TC-HOME-015 | Should be responsive on moblie viewport @regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload({ waitUntil: 'domcontentloaded'});
    // Key elements should still be visible
    await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
  })


  // ─── Footer ────────────────────────────────────────────────────────────────

  // ---------- Need to get working ----------
  // How to get it to work when react keeps adding more lanes to page?
  /*
  test('TC-HOME-016 | Should have footer with links @regression', async ({ homePage }) => {
    await homePage.scrollToElement(homePage.footerLinks.first());
    const footerLinkCount = await homePage.footerLinks.count();
    console.log(footerLinkCount);
    expect(footerLinkCount, 'Footer should have links').toBeGreaterThan(0);
  });
  */









});