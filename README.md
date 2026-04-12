# 🎬 Tubi TV — Playwright Test Framework

A senior-level, production-ready end-to-end test framework for [tubitv.com](https://tubitv.com) built with **Playwright** + **TypeScript**.

---

## 📁 Project Structure

```
tubi-tests/
├── .github/
│   └── workflows/
│       ├── playwright.yml      # Main CI/CD pipeline (smoke + regression + mobile)
│       └── pr-check.yml        # PR fast-feedback smoke check + PR comment
├── fixtures/
│   └── pages.ts                # Extended test fixtures (all POMs pre-wired)
├── pages/                      # Page Object Models
│   ├── BasePage.ts             # Abstract base with shared helpers & assertions
│   ├── HomePage.ts
│   ├── SearchPage.ts
│   ├── ContentPage.ts
│   ├── AuthPage.ts
│   └── BrowsePage.ts
├── tests/
│   ├── e2e/
│   │   ├── home.spec.ts        # Home page tests (@smoke + @regression)
│   │   ├── search.spec.ts      # Search functionality tests
│   │   ├── auth.spec.ts        # Authentication & security tests
│   │   └── browse.spec.ts      # Browse/category tests
│   ├── api/
│   │   └── network.spec.ts     # HTTP/API-level tests
│   └── visual/
│       └── visual.spec.ts      # Visual regression (screenshot comparison)
├── utils/
│   ├── testData.ts             # Centralised test data & constants
│   ├── apiHelper.ts            # Typed API request wrapper
│   └── accessibilityHelper.ts  # A11y audit utilities
├── playwright.config.ts        # Full multi-browser + sharding config
├── tsconfig.json
├── .eslintrc.json
├── .env.example
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 9+

### Installation

```bash
git clone https://github.com/YOUR_ORG/tubi-playwright-tests.git
cd tubi-playwright-tests
npm ci
npm run install:browsers
```

### Environment Setup

```bash
cp .env.example .env
# Fill in TUBI_TEST_EMAIL and TUBI_TEST_PASSWORD
```

---

## 🧪 Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all tests (headless) |
| `npm run test:smoke` | Run `@smoke` tagged tests only |
| `npm run test:regression` | Run `@regression` tagged tests |
| `npm run test:headed` | Run with visible browser |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:debug` | Run in debug/step mode |
| `npm run test:e2e` | Run only E2E tests |
| `npm run report` | Open last HTML report |

### Run a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=mobile-chrome
```

### Run a specific test file

```bash
npx playwright test tests/e2e/search.spec.ts
```

### Update visual baselines

```bash
npx playwright test --update-snapshots tests/visual/
```

---

## 🏗️ Architecture

### Page Object Model (POM)
All pages extend `BasePage`, which provides:
- Navigation helpers (`goto`, `waitForPageLoad`)
- Interaction helpers (`fillInput`, `clickAndWaitForNavigation`)
- Assertion wrappers (`assertVisible`, `assertText`, `assertURL`)
- Screenshot utilities

### Fixtures
Tests import from `fixtures/pages.ts` instead of `@playwright/test` directly:

```typescript
import { test, expect } from '../../fixtures/pages';

test('my test', async ({ homePage, searchPage }) => {
  await homePage.navigateToHome();
  await searchPage.searchFor('action');
});
```

### Test Tagging Strategy

| Tag | When it runs |
|---|---|
| `@smoke` | Every push, every PR — fast feedback |
| `@regression` | Merges to `main` + nightly schedule |

---

## ⚙️ CI/CD Pipeline

### Workflows

#### `playwright.yml` — Main pipeline
```
Push/PR → lint → smoke (Chromium)
                    ↓ (on main / schedule)
             regression (Chrome + Firefox + Safari, 4 shards each)
                    ↓
             merge-reports → upload HTML artifact
             mobile tests (Pixel 7, iPhone 14)
```

#### `pr-check.yml` — PR fast feedback
- Runs smoke tests on every PR
- Posts a ✅/❌ comment directly on the PR with a link to the report
- Cancels stale runs on new pushes (`concurrency` group)

### GitHub Secrets Required

| Secret | Description |
|---|---|
| `TUBI_TEST_EMAIL` | Test account email |
| `TUBI_TEST_PASSWORD` | Test account password |
| `SLACK_WEBHOOK_URL` | Slack webhook for nightly failure alerts |

---

## 🔒 Security Testing

The framework includes built-in security assertions:
- **HTTPS enforcement** — all pages served over TLS
- **XSS injection** — search inputs are sanitized
- **Mixed content** — no HTTP resources on HTTPS pages
- **Password masking** — `type=password` enforced
- **Header inspection** — security headers validated
- **No credential leakage** — passwords not exposed in DOM

---

## ♿ Accessibility Testing

`AccessibilityHelper` provides:
- Images with alt text
- Keyboard focusable interactive elements
- Single `<h1>` per page
- `lang` attribute on `<html>`
- ARIA landmark regions (`main`, `nav`)
- No empty buttons

For full WCAG auditing, integrate `@axe-core/playwright`:
```bash
npm install --save-dev @axe-core/playwright
```

---

## 📊 Reporting

- **HTML Report** — `playwright-report/index.html` (auto-opens on failure locally)
- **JSON Report** — `test-results/results.json`
- **JUnit XML** — `test-results/junit.xml` (compatible with Jenkins, Azure DevOps)
- **GitHub Actions** — native annotations via `reporter: github`
- **Artifacts** — uploaded to GitHub Actions for 7–30 days depending on suite

---

## 🤝 Contributing

1. Branch from `develop`
2. Add tests with appropriate `@smoke` or `@regression` tags
3. Run `npm run typecheck && npm run lint` before pushing
4. PR triggers automatic smoke check with a result comment

---

## 📜 License

MIT