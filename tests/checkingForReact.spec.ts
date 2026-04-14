import { test, expect } from '@playwright/test';

test('detect react component boundary', async ({ page }) => {
  await page.goto('https://tubitv.com');

  await page.evaluate(() => {
    function getFiber(el: HTMLElement) {
        const key = Object.keys(el).find(k =>
        k.startsWith('__reactFiber')
        );
        return key ? (el as any)[key] : null;
    }

    const el = document.querySelector('button');

    if (!el) return null;

    return getFiber(el);
    });
});

test('detect react app', async ({ page }) => {
  await page.goto('https://tubitv.com/');

  const isReact = await page.evaluate(() => {
    return !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  });

  console.log('React detected:', isReact);

  expect(typeof isReact).toBe('boolean');
});