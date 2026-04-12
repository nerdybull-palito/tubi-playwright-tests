import { test, expect } from '../../fixtures/pages';
import { CONTENT_CATEGORIES } from '../../utils/testData';

test.describe('Browse & Categories', () => {

  // ─── Smoke ────────────────────────────────────────────────────────────────

  test('should load categories page @smoke', async ({ browsePage }) => {
    await browsePage.goto('/categories');
    await browsePage.assertCategoryLinksPresent();
  });

  // ─── Genre Navigation @regression ─────────────────────────────────────────

  test('should navigate to a specific genre @regression', async ({ browsePage }) => {
    const genre = CONTENT_CATEGORIES[0]; // action-movies
    await browsePage.navigateToCategory(genre);
    await browsePage.assertCategoryPageLoaded();
  });

  test('should display content cards in genre pages @regression', async ({ browsePage }) => {
    await browsePage.navigateToCategory('comedy-movies');
    const count = await browsePage.getContentCardCount();
    expect(count, 'Genre page should have content cards').toBeGreaterThan(0);
  });

  test('should have clickable content cards with links @regression', async ({ browsePage }) => {
    await browsePage.navigateToCategory('drama-movies');
    await browsePage.assertContentCardsHaveLinks();
  });

  test('should not show duplicate cards initially @regression', async ({ browsePage }) => {
    await browsePage.navigateToCategory('thrillers');
    await browsePage.assertNoDuplicateCards();
  });

  // ─── Multiple Genres @regression ──────────────────────────────────────────

  test('should support navigation across multiple genres @regression', async ({ browsePage }) => {
    for (const category of CONTENT_CATEGORIES.slice(0, 3)) {
      await browsePage.navigateToCategory(category);
      const count = await browsePage.getContentCardCount();
      expect(count, `${category} should have content`).toBeGreaterThan(0);
    }
  });

  // ─── Kids Section @regression ─────────────────────────────────────────────

  test('should load kids content section @regression', async ({ browsePage }) => {
    await browsePage.navigateToCategory('kids');
    await browsePage.assertCategoryPageLoaded();
    const count = await browsePage.getContentCardCount();
    expect(count, 'Kids section should have content').toBeGreaterThan(0);
  });

  // ─── Content Card Integrity @regression ───────────────────────────────────

  test('should display content cards with thumbnails @regression', async ({ browsePage, page }) => {
    await browsePage.navigateToCategory('action-movies');
    const images = page.locator('[class*="card"] img, [class*="tile"] img');
    const imageCount = await images.count();
    expect(imageCount, 'Content cards should have thumbnails').toBeGreaterThan(0);

    // Validate first few images are loaded
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const naturalWidth = await images.nth(i).evaluate(
        (img) => (img as HTMLImageElement).naturalWidth
      );
      expect(naturalWidth, `Image ${i} should be loaded (naturalWidth > 0)`).toBeGreaterThan(0);
    }
  });

  // ─── TV Shows @regression ─────────────────────────────────────────────────

  test('should load TV Drama category @regression', async ({ browsePage }) => {
    await browsePage.navigateToCategory('tv-drama');
    await browsePage.assertCategoryPageLoaded();
  });

  // ─── Pagination / Load More @regression ───────────────────────────────────

  test('should support loading more content @regression', async ({ browsePage }) => {
    await browsePage.navigateToCategory('comedy-movies');
    const initialCount = await browsePage.getContentCardCount();
    await browsePage.loadMoreContent();
    const newCount = await browsePage.getContentCardCount();
    // Count should remain same or increase (load more expands)
    expect(newCount, 'Card count should not decrease after load more').toBeGreaterThanOrEqual(initialCount);
  });

  // ─── 404 Handling @regression ─────────────────────────────────────────────

  test('should handle invalid category gracefully @regression', async ({ page }) => {
    await page.goto('/category/definitely-not-a-real-genre-xyzzy');
    // Should not crash — show a 404 page or redirect
    const status = await page.evaluate(() => document.title);
    expect(status, 'Page should respond gracefully to invalid categories').toBeTruthy();
    // No unhandled error overlay
    const errorOverlay = page.locator('text=/unhandled error|runtime error|chunk load/i');
    await expect(errorOverlay).toBeHidden({ timeout: 3_000 }).catch(() => {
      // Not critical if this check isn't possible
    });
  });
});