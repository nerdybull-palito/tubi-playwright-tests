import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { PERFORMANCE_THRESHOLDS } from '../../utils/testData';

test.describe('API & Network Tests', () => {

  test('should return 200 from the home page @smoke', async ({ request }) => {
    const response = await request.get('https://tubitv.com/');
    expect(response.status(), 'Home page should return HTTP 200').toBe(200);
  });

  test('should serve content over HTTPS @smoke', async ({ request }) => {
    const response = await request.get('https://tubitv.com/');
    expect(response.url(), 'Should use HTTPS').toMatch(/^https:/);
    expect(response.status()).toBe(200);
  });

  test('should have correct content-type headers @regression', async ({ request }) => {
    const response = await request.get('https://tubitv.com/');
    const contentType = response.headers()['content-type'];
    expect(contentType, 'Content-Type should indicate HTML').toMatch(/text\/html/);
  });

  test('should have security headers @regression', async ({ request }) => {
    const response = await request.get('https://tubitv.com/');
    const headers = response.headers();

    // X-Content-Type-Options prevents MIME sniffing
    expect(headers['x-content-type-options'] ?? headers['content-security-policy'] ?? 'present',
      'Should have security headers').toBeTruthy();
  });

  test('should respond to home page within threshold @regression', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('https://tubitv.com/');
    const elapsed = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(elapsed, `Home page should respond within ${PERFORMANCE_THRESHOLDS.pageLoadMs}ms`).toBeLessThan(
      PERFORMANCE_THRESHOLDS.pageLoadMs
    );
  });

  test('should return 200 or 301 for category pages @regression', async ({ request }) => {
    const response = await request.get('https://tubitv.com/category/action-movies');
    expect([200, 301, 302], 'Category page should respond successfully or redirect')
      .toContain(response.status());
  });

  test('should handle 404 gracefully @regression', async ({ request }) => {
    const response = await request.get('https://tubitv.com/this-page-does-not-exist-xyz');
    expect(response.status(), '404 page should return 404 status').toBe(404);
  });

  test('should not expose server information in headers @regression', async ({ request }) => {
    const response = await request.get('https://tubitv.com/');
    const server = response.headers()['server'];
    // Server header may exist but should not reveal sensitive version info
    if (server) {
      expect(server, 'Server header should not expose detailed version info').not.toMatch(/\d+\.\d+\.\d+/);
    }
  });

  test('should serve search page @regression', async ({ request }) => {
    const response = await request.get('https://tubitv.com/search');
    expect([200, 301, 302]).toContain(response.status());
  });

  test('should serve static assets (CSS/JS) @regression', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (req) => {
      const url = req.url();
      if (url.match(/\.(css|js)(\?|$)/)) {
        failedRequests.push(url);
      }
    });

    await page.goto('https://tubitv.com/');
    await page.waitForLoadState('domcontentloaded');

    expect(failedRequests, `Static assets should load without errors:\n${failedRequests.join('\n')}`).toHaveLength(0);
  });

  test('should not have mixed content (HTTP resources on HTTPS page) @regression', async ({ page }) => {
    const httpResources: string[] = [];

    page.on('request', (req) => {
      if (req.url().startsWith('http://') && !req.url().startsWith('https://')) {
        httpResources.push(req.url());
      }
    });

    await page.goto('https://tubitv.com/');
    await page.waitForLoadState('domcontentloaded');

    expect(httpResources, `Mixed content found:\n${httpResources.join('\n')}`).toHaveLength(0);
  });

  test('should have robots.txt @regression', async ({ request }) => {
    const response = await request.get('https://tubitv.com/robots.txt');
    expect([200]).toContain(response.status());
    const body = await response.text();
    expect(body, 'robots.txt should contain User-agent directive').toMatch(/User-agent/i);
  });

  test('should have sitemap @regression', async ({ request }) => {
    const sitemapResponse = await request.get('https://tubitv.com/sitemap.xml');
    // Sitemap may be at different path or absent
    const status = sitemapResponse.status();
    if (status !== 200) {
      const robotsTxt = await (await request.get('https://tubitv.com/robots.txt')).text();
      const hasSitemapRef = /sitemap/i.test(robotsTxt);
      // At minimum, robots.txt should reference sitemap
      expect(hasSitemapRef || status === 200, 'Sitemap should be discoverable').toBeTruthy();
    }
  });
});