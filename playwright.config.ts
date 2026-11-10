import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Smoke tests against the production build (`next start`).
 * Run `npm run build` first. Set E2E_BASE_URL to test a deployed site instead,
 * e.g. E2E_BASE_URL=https://d2t2gio7o197fi.cloudfront.net npm run test:e2e
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        // Process env wins over .env files, so these override a local NEXTAUTH_URL that points at
        // the dev server's port. The secret only signs test cookies (CI has no .env files).
        env: {
          AUTH_URL: baseURL,
          NEXTAUTH_URL: baseURL,
          AUTH_TRUST_HOST: "true",
          AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-only-placeholder-secret-not-used-in-production",
        },
      },
});
