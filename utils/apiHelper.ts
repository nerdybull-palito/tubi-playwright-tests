import { type APIRequestContext, expect } from '@playwright/test';

/**
 * Tubi API helper — wraps Playwright's APIRequestContext for
 * structured REST calls with built-in assertions.
 */
export class ApiHelper {
  private readonly request: APIRequestContext;
  private readonly baseURL: string;

  constructor(request: APIRequestContext, baseURL = 'https://tubitv.com') {
    this.request = request;
    this.baseURL = baseURL;
  }

  // ─── Generic Methods ──────────────────────────────────────────────────────

  async get<T = unknown>(
    path: string,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<{ status: number; body: T }> {
    const url = new URL(path, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const response = await this.request.get(url.toString(), { headers });
    const body = await response.json().catch(() => ({}));
    return { status: response.status(), body: body as T };
  }

  async post<T = unknown>(
    path: string,
    payload: unknown,
    headers?: Record<string, string>
  ): Promise<{ status: number; body: T }> {
    const response = await this.request.post(`${this.baseURL}${path}`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status(), body: body as T };
  }

  // ─── Assertion Helpers ────────────────────────────────────────────────────

  assertStatus(actual: number, expected: number): void {
    expect(actual, `Expected HTTP ${expected} but got ${actual}`).toBe(expected);
  }

  assertStatusRange(actual: number, min: number, max: number): void {
    expect(actual, `Expected status between ${min}-${max}, got ${actual}`).toBeGreaterThanOrEqual(min);
    expect(actual).toBeLessThanOrEqual(max);
  }

  assertBodyHasKey(body: unknown, key: string): void {
    expect(body, `Response body should contain key: ${key}`).toHaveProperty(key);
  }

  // ─── Specific Tubi Endpoints ──────────────────────────────────────────────

  async healthCheck(): Promise<number> {
    const response = await this.request.get(`${this.baseURL}/`);
    return response.status();
  }

  async getSearchResults(query: string): Promise<{ status: number; body: unknown }> {
    return this.get('/api/video/search', { query });
  }

  async getContentDetails(contentId: string): Promise<{ status: number; body: unknown }> {
    return this.get(`/api/video/content/${contentId}`);
  }

  async validateResponseTime(path: string, maxMs: number): Promise<void> {
    const start = Date.now();
    const response = await this.request.get(`${this.baseURL}${path}`);
    const elapsed = Date.now() - start;

    expect(response.ok(), `Request to ${path} should succeed`).toBeTruthy();
    expect(elapsed, `${path} should respond within ${maxMs}ms`).toBeLessThan(maxMs);
  }
}