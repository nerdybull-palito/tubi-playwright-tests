import { type Page, type Locator, expect } from 'playwright/test';

/**
 *  Basepage - every POM extends this.
 *  Provides shared navigation helpers, wait strategies, and assertion wrappers.
 */

export abstract class BasePage {
    readonly page: Page;
    readonly url: string;

    constructor(page: Page, url = '/') {
        this.page = page;
        this.url = url;
    }

    // ─── Navigation ───────────────────────────────────────────────────────────

    async goto(path?: string): Promise<void> {
        await this.page.goto(path ?? this.url, { waitUntil: 'domcontentloaded' });
        await this.waitForPageLoad();
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        // Tubi uses React — wait for hydration signal or stable DOM
        await this.page.waitForFunction(() => document.readyState === 'complete', {
            timeout: 20_000,
        });
    }

    async reloadPage(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded'});
        await this.waitForPageLoad();
    }

    // ─── Interaction Helpers ──────────────────────────────────────────────────

    async clickAndWaitForNavigation(locator: Locator): Promise<void> {
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded'}),
            locator.click(),
        ]);
    }

    async fillInput(locator: Locator, value: string): Promise<void> {
        await locator.clear();
        await locator.fill(value);
        await expect(locator).toHaveValue(value)
    } 

    async scrollToElement(locator: Locator): Promise<void> {
        await locator.scrollIntoViewIfNeeded();
    }

    async hoverElement(locator: Locator): Promise<void> {
        await locator.hover();
    }

    // ─── Wait Helpers ─────────────────────────────────────────────────────────

    async waitForSelector(selector: string, timeout = 15_000): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'visible', timeout});
    }

    async waitForURL(urlOrPattern: string | RegExp): Promise<void> {
        await this.page.waitForURL(urlOrPattern, { timeout: 30_000 });
    }

    async waitForNetworkIdle(): Promise<void> {
        await this.page.waitForLoadState('networkidle', { timeout: 30_000 });
    }

    // ─── Assertion Helpers ────────────────────────────────────────────────────

    async assertPageTitle(expectedTitle: string | RegExp): Promise<void> {
        await expect(this.page).toHaveTitle(expectedTitle);
    }

    async assertURL(expectedURL: string | RegExp): Promise<void> {
        await expect(this.page).toHaveURL(expectedURL);
    }

    async assertVisible(locator: Locator, message?: string): Promise<void> {
        await expect(locator, message).toBeVisible();
    }

    async assertHidden(locator: Locator, message?: string): Promise<void> {
        await expect(locator, message).toBeHidden();
    }

    async assertText(locator: Locator, text: string | RegExp): Promise<void> {
        await expect(locator).toContainText(text);
    }

    async assertCount(locator: Locator, count: number): Promise<void> {
        await expect(locator).toHaveCount(count);
    }

    async assertEnabled(locator: Locator): Promise<void> {
        await expect(locator).toBeEnabled();
    }

    // ─── Accessibility ────────────────────────────────────────────────────────

    async getPageTitle(): Promise<string> {
        return this.page.title();
    }

    async getCurrentURL(): Promise<string> {
        return this.page.url();
    }

    // ─── Screenshot ───────────────────────────────────────────────────────────

    async takeScreenshot(name: string): Promise<Buffer> {
        return this.page.screenshot({ path: 'test-results/screenshots/${name}.png', fullPage:true });
    }
}