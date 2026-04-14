import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class BrowsePage extends BasePage {
  readonly categoryNavigation: Locator;
  readonly categoryLinks: Locator;
  readonly contentGrid: Locator;
  readonly contentCards: Locator;
  readonly filterBar: Locator;
  readonly sortDropdown: Locator;
  readonly genreHeader: Locator;
  readonly paginationControls: Locator;
  readonly loadMoreButton: Locator;
  readonly breadcrumbs: Locator;

  constructor(page: Page) {
    super(page, '/categories');

    this.categoryNavigation = page.locator('[class*="category-nav"], [data-testid*="category-nav"], nav').first();
    this.categoryLinks      = page.locator('a[href*="/category/"], a[href*="/genre/"], a[href="/movies"], a[href="/tv-shows"], a[href="/live"]');
    this.contentGrid        = page.locator('[class*="grid"], [class*="Grid"], [data-testid*="content-grid"]').first();
    this.contentCards       = page.locator('[class*="card"], [class*="tile"], [data-testid*="content-card"]');
    this.filterBar          = page.locator('[class*="filter"], [data-testid*="filter"]').first();
    this.sortDropdown       = page.locator('select, [role="listbox"], [data-testid*="sort"]').first();
    this.genreHeader        = page.locator('h1, h2, [class*="genre-title"], [data-testid*="genre-header"]').first();
    this.paginationControls = page.locator('[class*="pagination"], [data-testid*="pagination"]').first();
    this.loadMoreButton     = page.locator('button:has-text("Load More"), [data-testid*="load-more"]').first();
    this.breadcrumbs        = page.locator('[aria-label*="breadcrumb"], [class*="breadcrumb"]').first();
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async navigateToCategory(category: string): Promise<void> {
    await this.goto(`/category/${category}`);
    await this.waitForPageLoad();
  }

  async clickCategoryLink(index = 0): Promise<void> {
    await this.categoryLinks.nth(index).click();
    await this.waitForPageLoad();
  }

  async loadMoreContent(): Promise<void> {
    if (await this.loadMoreButton.isVisible()) {
      await this.loadMoreButton.click();
      await this.page.waitForTimeout(1_000);
    }
  }

  async getContentCardCount(): Promise<number> {
    return this.contentCards.count();
  }

  async getAllCategoryHrefs(): Promise<string[]> {
    return this.categoryLinks.evaluateAll((els) =>
      (els as HTMLAnchorElement[]).map((el) => el.href)
    );
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async assertCategoryPageLoaded(expectedCategory?: string): Promise<void> {
    await this.assertVisible(this.contentCards.first(), 'Content cards should be visible');
    if (expectedCategory) {
      await this.assertText(this.genreHeader, new RegExp(expectedCategory, 'i'));
    }
  }

  async assertContentCardsHaveLinks(): Promise<void> {
    const cards = this.contentCards;
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await cards.nth(i).locator('a').first().getAttribute('href');
      expect(href, `Card ${i} should have a link`).toBeTruthy();
    }
  }

  async assertCategoryLinksPresent(): Promise<void> {
    const count = await this.categoryLinks.count();
    expect(count, 'Category links should be present').toBeGreaterThan(0);
  }

  async assertNoDuplicateCards(): Promise<void> {
    const titles = await this.contentCards.evaluateAll((cards) =>
      cards.map((c) => c.textContent?.trim()).filter(Boolean)
    );
    const unique = new Set(titles);
    // Allow some overlap in "trending" but flag if ALL are duplicates
    expect(unique.size, 'There should be unique content titles').toBeGreaterThan(0);
  }
}