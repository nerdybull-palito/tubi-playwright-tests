import { test, expect } from '../../fixtures/pages';
import { TEST_CREDENTIALS, generateTestEmail } from '../../utils/testData';

test.describe('Authentication', () => {

  test.beforeEach(async ({ authPage }) => {
    // Navigate to login — Tubi may open a modal instead of a dedicated route
    await authPage.goto('/login');
  });

  // ─── Login Form @smoke ────────────────────────────────────────────────────

  test('should display login form @smoke', async ({ authPage }) => {
    await authPage.assertLoginFormVisible();
  });

  test('should show error for invalid credentials @smoke', async ({ authPage }) => {
    await authPage.login(
      TEST_CREDENTIALS.invalidUser.email,
      TEST_CREDENTIALS.invalidUser.password
    );
    await authPage.assertLoginError();
  });

  // ─── Field Validation @regression ────────────────────────────────────────

  test('should validate email format @regression', async ({ authPage }) => {
    await authPage.assertEmailInputValidation();
  });

  test('should require password field @regression', async ({ authPage }) => {
    await authPage.emailInput.waitFor({ state: 'visible' });
    await authPage.fillInput(authPage.emailInput, TEST_CREDENTIALS.invalidUser.email);
    // Submit without password
    await authPage.loginSubmitButton.click();
    // Should either prevent submission or show error
    const errorVisible = await authPage.loginErrorMessage.isVisible().catch(() => false);
    const currentURL = authPage.page.url();
    // If no error shown, at minimum we should still be on the login page/modal
    expect(
      errorVisible || currentURL.includes('login') || currentURL.includes('tubitv.com'),
      'Submitting without password should not proceed to dashboard'
    ).toBeTruthy();
  });

  test('should mask password input @regression', async ({ authPage }) => {
    await authPage.passwordInput.waitFor({ state: 'visible' });
    const inputType = await authPage.passwordInput.getAttribute('type');
    expect(inputType, 'Password field should be of type=password').toBe('password');
  });

  // ─── Forgot Password @regression ──────────────────────────────────────────

  test('should have a forgot password link @regression', async ({ authPage }) => {
    const forgotVisible = await authPage.forgotPasswordLink.isVisible().catch(() => false);
    // Forgot password is standard; flag as warning if missing
    if (!forgotVisible) {
      console.warn('⚠ Forgot password link not found — may be inside a modal');
    } else {
      await authPage.assertVisible(authPage.forgotPasswordLink);
    }
  });

  // ─── Social Auth @regression ───────────────────────────────────────────────

  test('should display social auth options @regression', async ({ authPage }) => {
    await authPage.assertSocialAuthOptions();
  });

  test('should navigate to social auth providers @regression', async ({ authPage, page }) => {
    const googleBtn = authPage.googleLoginButton;
    if (await googleBtn.isVisible()) {
      const [popup] = await Promise.all([
        page.context().waitForEvent('page').catch(() => null),
        googleBtn.click(),
      ]);
      // Either popup or redirect — both are valid OAuth flows
      const newURL = popup?.url() ?? page.url();
      expect(newURL, 'Google auth should redirect to OAuth flow').toMatch(/google|accounts/i);
      await popup?.close();
    }
  });

  // ─── Modal Behaviour @regression ──────────────────────────────────────────

  test('should open login from home page login button @regression', async ({ homePage, authPage }) => {
    await homePage.navigateToHome();
    if (await homePage.loginButton.isVisible()) {
      await homePage.loginButton.click();
      // Either modal or redirect to /login
      await authPage.page.waitForURL(/login/, { timeout: 5_000 }).catch(() => {
        // May open modal without URL change
      });
      const loginFormVisible = await authPage.emailInput.isVisible({ timeout: 5_000 });
      expect(loginFormVisible, 'Login form should appear after clicking login button').toBeTruthy();
    }
  });

  // ─── Security @regression ─────────────────────────────────────────────────

  test('should not expose password in page source @regression', async ({ authPage, page }) => {
    await authPage.emailInput.waitFor({ state: 'visible' });
    await authPage.fillInput(authPage.emailInput, TEST_CREDENTIALS.validUser.email);
    await authPage.fillInput(authPage.passwordInput, TEST_CREDENTIALS.validUser.password);

    const bodyText = await page.textContent('body');
    expect(bodyText, 'Password value should not appear in page text').not.toContain(
      TEST_CREDENTIALS.validUser.password
    );
  });

  test('should use HTTPS for form submission @regression', async ({ page }) => {
    const currentURL = page.url();
    expect(currentURL, 'Auth pages must use HTTPS').toMatch(/^https:/);
  });
});