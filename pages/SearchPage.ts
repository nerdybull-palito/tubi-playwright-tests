import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly resultCards: Locator;
  readonly noResultsMessage: Locator;
  readonly resultCount: Locator;
  readonly categoryFilter: Locator;
  readonly loadingSpinner: Locator;
  readonly trendingSection: Locator;

  constructor(page: Page) {
    super(page, '/search');

    this.searchInput      = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    this.searchResults    = page.locator('[class*="search-result"], [data-testid*="search-result"], [class*="SearchResult"]');
    this.resultCards      = page.locator('[class*="card"], [class*="tile"], [data-testid*="content-card"]');
    this.noResultsMessage = page.locator('[class*="no-result"], text=/no results/i');
    this.resultCount      = page.locator('[class*="result-count"], [data-testid*="result-count"]');
    this.categoryFilter   = page.locator('[class*="filter"], [role="tab"]');
    this.loadingSpinner   = page.locator('[class*="spinner"], [class*="loading"], [aria-label*="loading" i]');
    this.trendingSection  = page.locator('[class*="trending"], [data-testid*="trending"]');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async searchFor(query: string): Promise<void> {
    await this.goto('/search');
    await this.searchInput.waitFor({ state: 'visible' });
    await this.fillInput(this.searchInput, query);
    await this.page.keyboard.press('Enter');
    await this.waitForSearchResults();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  async waitForSearchResults(): Promise<void> {
    // Wait for spinner to disappear if it appears
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10_000 });
    } catch {
      // spinner may not appear for fast responses
    }
    await this.page.waitForTimeout(500); // debounce buffer
  }

  async getResultCount(): Promise<number> {
    return this.resultCards.count();
  }

  async getFirstResultTitle(): Promise<string | null> {
    const firstCard = this.resultCards.first();
    return firstCard.textContent();
  }

  async clickResultByIndex(index = 0): Promise<void> {
    await this.resultCards.nth(index).click();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async assertSearchResultsVisible(): Promise<void> {
    const count = await this.getResultCount();
    expect(count, 'Search should return at least one result').toBeGreaterThan(0);
  }

  async assertNoResultsShown(): Promise<void> {
    await this.assertVisible(this.noResultsMessage, 'No results message should be visible');
  }

  async assertURLContainsQuery(query: string): Promise<void> {
    await this.assertURL(new RegExp(encodeURIComponent(query), 'i'));
  }

  async assertResultCardsHaveImages(): Promise<void> {
    const images = this.resultCards.locator('img');
    const count = await images.count();
    expect(count, 'Result cards should contain images').toBeGreaterThan(0);

    // Validate images have src attributes
    for (let i = 0; i < Math.min(count, 5); i++) {
      const src = await images.nth(i).getAttribute('src');
      expect(src, `Image ${i} should have a src attribute`).toBeTruthy();
    }
  }
}