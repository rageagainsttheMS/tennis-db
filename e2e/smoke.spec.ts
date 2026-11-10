import { expect, test } from "@playwright/test";

// Pages that don't need the database, so these run in CI without one.

test("health endpoint responds", async ({ request }) => {
  const res = await request.get("/api/health");

  expect(res.ok()).toBe(true);
  expect(await res.json()).toEqual({ status: "ok" });
});

test("home page is public and shows the search", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Search the ultimate tennis database" })).toBeVisible();
  await expect(page.getByPlaceholder("Search players...")).toBeVisible();
});

test("search tabs switch between players and tournaments", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("tab", { name: "Tournaments" }).click();

  await expect(page.getByPlaceholder("Search tournaments...")).toBeVisible();
  await expect(page.getByPlaceholder("Search players...")).toBeHidden();
});

test("sign-in page offers Google sign-in", async ({ page }) => {
  await page.goto("/signIn");

  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
});

test("admin pages redirect anonymous visitors to sign-in", async ({ page }) => {
  await page.goto("/admin/players");

  await expect(page).toHaveURL(/\/signIn\?callbackUrl=%2Fadmin%2Fplayers/);
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
});

test("unknown match ids show the not-found page instead of an error", async ({ page }) => {
  // The status is 200, not 404: app/loading.tsx streams the response before the page calls
  // notFound() (a Next.js "soft 404"), so check the content instead.
  await page.goto("/match/not-a-number");

  await expect(page.getByRole("heading", { name: "404 - Page Not Found" })).toBeVisible();
});
