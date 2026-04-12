import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  // ─── Login Form ───────────────────────────────────────────────────────────
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly loginErrorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginForm: Locator;

  // ─── Sign Up Form ─────────────────────────────────────────────────────────
  readonly signupEmailInput: Locator;
  readonly signupPasswordInput: Locator;
  readonly signupBirthDateInput: Locator;
  readonly signupSubmitButton: Locator;
  readonly signupForm: Locator;
  readonly termsCheckbox: Locator;

  // ─── Social Auth ──────────────────────────────────────────────────────────
  readonly googleLoginButton: Locator;
  readonly appleLoginButton: Locator;
  readonly facebookLoginButton: Locator;

  // ─── Modal ────────────────────────────────────────────────────────────────
  readonly authModal: Locator;
  readonly closeModalButton: Locator;
  readonly switchToSignUp: Locator;
  readonly switchToLogin: Locator;

  constructor(page: Page) {
    super(page, '/login');

    this.emailInput         = page.locator('input[type="email"], input[name="email"]').first();
    this.passwordInput      = page.locator('input[type="password"]').first();
    this.loginSubmitButton  = page.locator('button[type="submit"]:has-text("Log In"), [data-testid*="login-submit"]').first();
    this.loginErrorMessage  = page.locator('[class*="error"], [role="alert"], [data-testid*="error"]').first();
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), [data-testid*="forgot-password"]').first();
    this.loginForm          = page.locator('form, [data-testid*="login-form"]').first();

    this.signupEmailInput    = page.locator('input[type="email"]').first();
    this.signupPasswordInput = page.locator('input[type="password"]').first();
    this.signupBirthDateInput = page.locator('input[type="date"], input[name*="birth" i], input[name*="dob" i]').first();
    this.signupSubmitButton  = page.locator('button[type="submit"]:has-text("Sign Up"), [data-testid*="signup-submit"]').first();
    this.signupForm          = page.locator('form[data-testid*="signup"], form').first();
    this.termsCheckbox       = page.locator('input[type="checkbox"][name*="terms" i], [data-testid*="terms"]').first();

    this.googleLoginButton   = page.locator('[aria-label*="Google"], button:has-text("Google")').first();
    this.appleLoginButton    = page.locator('[aria-label*="Apple"], button:has-text("Apple")').first();
    this.facebookLoginButton = page.locator('[aria-label*="Facebook"], button:has-text("Facebook")').first();

    this.authModal         = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').first();
    this.closeModalButton  = page.locator('[aria-label*="close" i], [data-testid*="close"]').first();
    this.switchToSignUp    = page.locator('text=Sign Up, [data-testid*="switch-signup"]').first();
    this.switchToLogin     = page.locator('text=Log In, [data-testid*="switch-login"]').first();
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
  }

  async submitLogin(): Promise<void> {
    await this.loginSubmitButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillLoginForm(email, password);
    await this.submitLogin();
  }

  async closeModal(): Promise<void> {
    if (await this.closeModalButton.isVisible()) {
      await this.closeModalButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async assertLoginFormVisible(): Promise<void> {
    await this.assertVisible(this.emailInput, 'Email input should be visible');
    await this.assertVisible(this.passwordInput, 'Password input should be visible');
    await this.assertVisible(this.loginSubmitButton, 'Login button should be visible');
  }

  async assertLoginError(expectedMessage?: string): Promise<void> {
    await this.assertVisible(this.loginErrorMessage, 'Error message should appear after invalid login');
    if (expectedMessage) {
      await this.assertText(this.loginErrorMessage, expectedMessage);
    }
  }

  async assertSocialAuthOptions(): Promise<void> {
    // At least one social auth option should be available
    const googleVisible = await this.googleLoginButton.isVisible().catch(() => false);
    const appleVisible  = await this.appleLoginButton.isVisible().catch(() => false);
    const fbVisible     = await this.facebookLoginButton.isVisible().catch(() => false);
    expect(
      googleVisible || appleVisible || fbVisible,
      'At least one social auth option should be visible'
    ).toBeTruthy();
  }

  async assertEmailInputValidation(): Promise<void> {
    await this.fillInput(this.emailInput, 'not-an-email');
    await this.loginSubmitButton.click();
    // Browser-native validation OR custom validation
    const isInvalid = await this.emailInput.evaluate(
      (el) => !(el as HTMLInputElement).checkValidity()
    );
    const errorVisible = await this.loginErrorMessage.isVisible().catch(() => false);
    expect(isInvalid || errorVisible, 'Invalid email should trigger validation').toBeTruthy();
  }

  async assertPasswordMinLength(): Promise<void> {
    await this.fillInput(this.passwordInput, '123');
    const validity = await this.passwordInput.evaluate(
      (el) => (el as HTMLInputElement).validity.tooShort
    );
    // Either browser validation or server-side error
    const errorVisible = await this.loginErrorMessage.isVisible().catch(() => false);
    expect(validity || errorVisible, 'Short password should fail validation').toBeTruthy();
  }
}