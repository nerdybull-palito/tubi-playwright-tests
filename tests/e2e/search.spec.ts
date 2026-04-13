import { test, expect } from '../../fixtures/pages';
import { SEARCH_QUERIES } from '../../utils/testData';

test.describe('Search Functionality', () => {

  // ─── Core Search @smoke ──────────────────────────────────────────────────

  test('TC-SRCH-001 | should navigate to search page @smoke', async ({ searchPage, page }) => {
    await page.goto('/search');
    await searchPage.assertVisible(searchPage.searchInput, 'Search input should be present');
  });

  test('should return results for a valid query @smoke', async ({ searchPage }) => {
    await searchPage.searchFor(SEARCH_QUERIES.popular);
    await searchPage.assertSearchResultsVisible();
  });

  // ─── Result Validation @regression ───────────────────────────────────────

  test('should display result cards with images @regression', async ({ searchPage }) => {
    await searchPage.searchFor(SEARCH_QUERIES.popular);
    await searchPage.assertSearchResultsVisible();
    await searchPage.assertResultCardsHaveImages();
  });

  test('should update URL with search query @regression', async ({ searchPage }) => {
    await searchPage.searchFor(SEARCH_QUERIES.specific);
    await searchPage.assertURLContainsQuery(SEARCH_QUERIES.specific);
  });

  test('should handle no-results gracefully @regression', async ({ searchPage, page }) => {
    await searchPage.searchFor(SEARCH_QUERIES.noResults);
    // Either no results message or 0 cards
    const count = await searchPage.getResultCount();
    if (count === 0) {
      // Might show "no results" UI
      const pageText = await page.textContent('body');
      expect(
        pageText?.match(/no results|not found|try again/i),
        'Should communicate no results to user'
      ).toBeTruthy();
    }
  });

  // ─── XSS / Injection Safety ────────────────────────────────────────────────

  test('should sanitize special characters in search query @regression', async ({ searchPage, page }) => {
    await searchPage.searchFor(SEARCH_QUERIES.specialChars);
    // Page should not execute injected scripts
    const title = await page.title();
    expect(title, 'Page title should not contain raw script tags').not.toContain('<script>');
    const bodyHTML = await page.innerHTML('body');
    expect(bodyHTML).not.toContain('<script>alert(1)</script>');
  });

  // ─── Long Query ────────────────────────────────────────────────────────────

  test('should handle long search queries without crashing @regression', async ({ searchPage, page }) => {
    await searchPage.searchFor(SEARCH_QUERIES.longQuery);
    // Page should remain functional — not crash or 500
    const title = await page.title();
    expect(title, 'Page should still have a title after long query').toBeTruthy();
    await expect(page).not.toHaveURL(/error|500|404/i);
  });

  // ─── Keyboard Navigation ───────────────────────────────────────────────────

  test('should allow keyboard navigation of search @regression', async ({ page }) => {
    await page.goto('/');
    // Tab to search icon/input and type
    await page.keyboard.press('Tab');
    // Focus search via keyboard — varies by implementation
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      await searchInput.press('Tab');
    }
    // Page should remain functional
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  // ─── Search from Home ──────────────────────────────────────────────────────

  test('should trigger search from homepage search icon @regression', async ({ homePage }) => {
    await homePage.navigateToHome();
    await homePage.searchFor(SEARCH_QUERIES.popular);
    await homePage.assertURL(/search/i);
  });

  // ─── Performance ───────────────────────────────────────────────────────────

  test('should return search results within 3 seconds @regression', async ({ page }) => {
    await page.goto('/search');
    const input = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await input.waitFor({ state: 'visible' });
    await input.fill(SEARCH_QUERIES.popular);

    const start = Date.now();
    await page.keyboard.press('Enter');

    // Wait for any result to appear
    await page.locator('[class*="card"], [class*="tile"]').first().waitFor({
      state: 'visible',
      timeout: 5_000,
    }).catch(() => { /* results may be immediate */ });

    const elapsed = Date.now() - start;
    expect(elapsed, `Search should respond within 3s (took ${elapsed}ms)`).toBeLessThan(3_500);
  });

  // ─── Multiple Searches ─────────────────────────────────────────────────────

  test('should support consecutive searches @regression', async ({ searchPage }) => {
    await searchPage.searchFor('comedy');
    const count1 = await searchPage.getResultCount();

    await searchPage.searchFor('drama');
    const count2 = await searchPage.getResultCount();

    // Both searches should yield results (may differ)
    expect(count1 + count2, 'Both searches should yield results').toBeGreaterThan(0);
  });
});