/**
 * Centralised test data — never hardcode in tests.
 */

export const TUBI_URLS = {
  home: '/',
  search: '/search',
  categories: '/categories',
  movies: '/category/thrillers',
  tvShows: '/category/tv-drama',
  kids: '/category/kids',
  login: '/login',
  signup: '/signup',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export const SEARCH_QUERIES = {
  popular: 'action',
  specific: 'The Dark Knight',
  noResults: 'xyzzyxyzzyqwerty12345',
  specialChars: '<script>alert(1)</script>',
  longQuery: 'a'.repeat(200),
  spanish: 'telenovela',
  emoji: '🎬',
} as const;

/* Uncomment this when using Credentials to login
export const TEST_CREDENTIALS = {
  // Use env vars in CI — these are placeholders
  validUser: {
    email: process.env.TUBI_TEST_EMAIL ?? 'test@example.com',
    password: process.env.TUBI_TEST_PASSWORD ?? 'TestPass123!',
  },
  invalidUser: {
    email: 'notauser@fake-domain-xyz.com',
    password: 'wrongpassword',
  },
  malformedEmail: {
    email: 'not-an-email',
    password: 'anypassword',
  },
} as const;
*/

export const CONTENT_CATEGORIES = [
  'action-movies',
  'comedy-movies',
  'drama-movies',
  'horror-movies',
  'thrillers',
  'tv-drama',
  'kids',
  'anime',
] as const;

export const EXPECTED_META = {
  titlePattern: /Tubi/i,
  descriptionPattern: /free|stream|watch/i,
  baseURL: 'https://tubitv.com',
} as const;

export const PERFORMANCE_THRESHOLDS = {
  pageLoadMs: 5_000,
  searchResponseMs: 3_000,
  imageLoadMs: 4_000,
} as const;

/**
 * Utility: sleep for n milliseconds (prefer waitForSelector over this)
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Utility: generate a random email for sign-up tests
 */
export const generateTestEmail = (): string => {
  const ts = Date.now();
  return `tubi.test.${ts}@mailinator.com`;
};

/**
 * Utility: extract numeric value from text (e.g. "1,234 results" → 1234)
 */
export const parseNumericText = (text: string): number =>
  parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;