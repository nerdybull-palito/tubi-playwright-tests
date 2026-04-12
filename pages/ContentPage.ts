import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContentPage extends BasePage {
  readonly contentTitle: Locator;
  readonly contentDescription: Locator;
  readonly playButton: Locator;
  readonly contentRating: Locator;
  readonly contentGenre: Locator;
  readonly contentYear: Locator;
  readonly contentDuration: Locator;
  readonly relatedContent: Locator;
  readonly addToQueueButton: Locator;
  readonly shareButton: Locator;
  readonly backButton: Locator;
  readonly videoPlayer: Locator;
  readonly playerControls: Locator;
  readonly closedCaptionButton: Locator;
  readonly fullscreenButton: Locator;
  readonly thumbnail: Locator;

  constructor(page: Page) {
    super(page, '/');

    this.contentTitle       = page.locator('h1, [data-testid*="title"], [class*="title"]').first();
    this.contentDescription = page.locator('[class*="description"], [data-testid*="description"], p').first();
    this.playButton         = page.locator('[aria-label*="play" i], [data-testid*="play"], button:has-text("Watch")').first();
    this.contentRating      = page.locator('[class*="rating"], [data-testid*="rating"]').first();
    this.contentGenre       = page.locator('[class*="genre"], [data-testid*="genre"]').first();
    this.contentYear        = page.locator('[class*="year"], [data-testid*="year"]').first();
    this.contentDuration    = page.locator('[class*="duration"], [data-testid*="duration"]').first();
    this.relatedContent     = page.locator('[class*="related"], [data-testid*="related"]').first();
    this.addToQueueButton   = page.locator('[aria-label*="queue" i], [data-testid*="queue"]').first();
    this.shareButton        = page.locator('[aria-label*="share" i], [data-testid*="share"]').first();
    this.backButton         = page.locator('[aria-label*="back" i], button:has-text("Back")').first();
    this.videoPlayer        = page.locator('video, [data-testid*="player"]').first();
    this.playerControls     = page.locator('[class*="player-controls"], [data-testid*="controls"]').first();
    this.closedCaptionButton = page.locator('[aria-label*="caption" i], [data-testid*="cc"]').first();
    this.fullscreenButton   = page.locator('[aria-label*="fullscreen" i], [data-testid*="fullscreen"]').first();
    this.thumbnail          = page.locator('[class*="thumbnail"], [class*="poster"] img').first();
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async clickPlay(): Promise<void> {
    await this.playButton.waitFor({ state: 'visible' });
    await this.playButton.click();
  }

  async waitForVideoToLoad(): Promise<void> {
    await this.videoPlayer.waitFor({ state: 'visible', timeout: 15_000 });
    // Allow buffering time
    await this.page.waitForTimeout(2_000);
  }

  async pauseVideo(): Promise<void> {
    await this.videoPlayer.click();
  }

  async toggleCaptions(): Promise<void> {
    if (await this.closedCaptionButton.isVisible()) {
      await this.closedCaptionButton.click();
    }
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async assertContentPageLoaded(): Promise<void> {
    await this.assertVisible(this.contentTitle, 'Content title should be visible');
    await this.assertVisible(this.playButton, 'Play button should be visible');
  }

  async assertContentMetadata(): Promise<void> {
    await this.assertVisible(this.contentTitle, 'Title must be visible');
    // Description is optional — just check title + play button
    const titleText = await this.contentTitle.textContent();
    expect(titleText?.trim().length, 'Title should not be empty').toBeGreaterThan(0);
  }

  async assertRelatedContentPresent(): Promise<void> {
    await this.assertVisible(this.relatedContent, 'Related content section should appear');
  }

  async assertThumbnailLoaded(): Promise<void> {
    const src = await this.thumbnail.getAttribute('src');
    expect(src, 'Thumbnail should have a source URL').toBeTruthy();
  }
}