import { type Page, type Locator, expect } from 'playwright/test';

/**
 *  Basepage - every POM extends this.
 *  Provides shared navigation helpers, wait strategies, and assertion wrappers.
 */

export abstract class Basepage {
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

    

}