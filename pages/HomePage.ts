import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────────────
  readonly nav: Locator;
  readonly logo: Locator;
  readonly searchIcon: Locator;
  readonly searchInput: Locator;
  readonly loginButton: Locator;
  readonly signUpButton: Locator;
  readonly heroSection: Locator;
  readonly featuredCarousel: Locator;
  readonly categoryRows: Locator;
  readonly movieCards: Locator;
  readonly contentRow: Locator;
  readonly footerLinks: Locator;
  readonly browseMenu: Locator;
  readonly genreLinks: Locator;

  constructor(page: Page) {
    super(page, '/');

    this.nav            = page.locator('nav, [role="navigation"]').first();
    this.logo           = page.locator('[aria-label*="Tubi"], a[href="/"]').first();
    this.searchIcon     = page.locator('[aria-label*="search" i], [data-testid*="search"]').first();
    this.searchInput    = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    this.loginButton    = page.locator('text=Log In, [data-testid="login-btn"]').first();
    this.signUpButton   = page.locator('text=Sign Up, [data-testid="signup-btn"]').first();
    this.heroSection    = page.locator('[class*="hero"], [data-testid*="hero"], .featured-hero').first();
    this.featuredCarousel = page.locator('[class*="carousel"], [class*="slider"], [data-testid*="carousel"]').first();
    this.categoryRows   = page.locator('[class*="row"], [data-testid*="content-row"]');
    this.movieCards     = page.locator('[class*="card"], [data-testid*="card"], [class*="tile"]');
    this.contentRow     = page.locator('[class*="container-row"], [class*="ContentRow"]').first();
    this.footerLinks    = page.locator('footer a');
    this.browseMenu     = page.locator('[aria-label*="browse" i], [data-testid*="browse"]').first();
    this.genreLinks     = page.locator('[href*="/category/"], [href*="/genre/"]');
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async navigateToHome(): Promise<void> {
    await this.goto('/');
    await this.assertPageTitle(/Tubi/i);
  }

  async openSearch(): Promise<void> {
    await this.searchIcon.click();
    await expect(this.searchInput).toBeVisible({ timeout: 5_000 });
  }

  async searchFor(query: string): Promise<void> {
    await this.openSearch();
    await this.fillInput(this.searchInput, query);
    await this.page.keyboard.press('Enter');
    await this.waitForURL(/search/i);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async clickSignUp(): Promise<void> {
    await this.signUpButton.click();
  }

  async getMovieCardCount(): Promise<number> {
    return this.movieCards.count();
  }

  async clickFirstMovieCard(): Promise<void> {
    const firstCard = this.movieCards.first();
    await firstCard.waitFor({ state: 'visible' });
    await firstCard.click();
  }

  async scrollToContentRow(rowIndex = 0): Promise<void> {
    const rows = this.categoryRows;
    await rows.nth(rowIndex).scrollIntoViewIfNeeded();
  }

  async getGenreLinks(): Promise<string[]> {
    const hrefs = await this.genreLinks.evaluateAll((els) =>
      (els as HTMLAnchorElement[]).map((el) => el.href)
    );
    return hrefs;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async assertHomePageLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Tubi/i);
    await expect(this.page).toHaveURL(/tubitv\.com\/?$/);
  }

  async assertNavigationVisible(): Promise<void> {
    await this.assertVisible(this.nav, 'Navigation should be visible');
  }

  async assertSearchFunctional(): Promise<void> {
    await this.assertVisible(this.searchIcon, 'Search icon should be visible');
  }

  async assertContentCardsPresent(): Promise<void> {
    const count = await this.getMovieCardCount();
    expect(count, 'Should have content cards on the home page').toBeGreaterThan(0);
  }

  async assertAuthButtonsPresent(): Promise<void> {
    // At least one of login/signup should be visible for unauthenticated users
    const loginVisible = await this.loginButton.isVisible().catch(() => false);
    const signupVisible = await this.signUpButton.isVisible().catch(() => false);
    expect(loginVisible || signupVisible, 'Auth buttons should be present').toBeTruthy();
  }
}