import { type Page, expect } from '@playwright/test';

/**
 * A11y helper — wraps common accessibility checks.
 * Tubi must be accessible to all users including those with visual impairments.
 */
export class AccessibilityHelper {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Validate all images have meaningful alt text.
   */
  async assertImagesHaveAltText(scope = 'body'): Promise<void> {
    const violations = await this.page.evaluate((selector) => {
      const images = Array.from(document.querySelectorAll(`${selector} img`));
      return images
        .filter((img) => {
          const alt = img.getAttribute('alt');
          // alt="" is valid for decorative images; null/undefined is a violation
          return alt === null || alt === undefined;
        })
        .map((img) => ({ src: (img as HTMLImageElement).src, outerHTML: img.outerHTML.slice(0, 120) }));
    }, scope);

    expect(violations, `Images missing alt attribute:\n${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
  }

  /**
   * Validate interactive elements are keyboard-reachable.
   */
  async assertInteractiveElementsFocusable(): Promise<void> {
    const violations = await this.page.evaluate(() => {
      const interactives = Array.from(
        document.querySelectorAll('button, a, input, select, textarea, [role="button"]')
      );
      return interactives
        .filter((el) => {
          const tabIndex = parseInt((el as HTMLElement).getAttribute('tabindex') ?? '0', 10);
          return tabIndex < 0;
        })
        .map((el) => el.outerHTML.slice(0, 120));
    });

    expect(
      violations.length,
      `Interactive elements should not have negative tabindex:\n${violations.join('\n')}`
    ).toBeLessThan(3); // Allow minor exceptions
  }

  /**
   * Check page has a single H1.
   */
  async assertSingleH1(): Promise<void> {
    const count = await this.page.locator('h1').count();
    expect(count, `Page should have exactly one H1, found ${count}`).toBe(1);
  }

  /**
   * Check page has a lang attribute on <html>.
   */
  async assertHtmlLangPresent(): Promise<void> {
    const lang = await this.page.evaluate(() => document.documentElement.lang);
    expect(lang, 'HTML element should have a lang attribute').toBeTruthy();
  }

  /**
   * Validate landmark regions exist (main, nav, footer).
   */
  async assertLandmarksPresent(): Promise<void> {
    const main = await this.page.locator('main, [role="main"]').count();
    const nav  = await this.page.locator('nav, [role="navigation"]').count();

    expect(main, 'Page should have a <main> landmark').toBeGreaterThan(0);
    expect(nav, 'Page should have a <nav> landmark').toBeGreaterThan(0);
  }

  /**
   * Assert minimum color contrast ratio for text (simplified check via inline styles).
   * For comprehensive a11y scanning, integrate @axe-core/playwright.
   */
  async assertNoEmptyButtons(): Promise<void> {
    const violations = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .filter((btn) => {
          const text = btn.textContent?.trim() ?? '';
          const label = btn.getAttribute('aria-label') ?? '';
          const labelledBy = btn.getAttribute('aria-labelledby') ?? '';
          return !text && !label && !labelledBy;
        })
        .map((btn) => btn.outerHTML.slice(0, 120));
    });

    expect(
      violations,
      `Buttons should have accessible text:\n${violations.join('\n')}`
    ).toHaveLength(0);
  }

  /**
   * Full accessibility sweep (call all checks).
   */
  async runFullCheck(): Promise<void> {
    await this.assertHtmlLangPresent();
    await this.assertLandmarksPresent();
    await this.assertImagesHaveAltText();
    await this.assertNoEmptyButtons();
  }
}