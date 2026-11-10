import { describe, expect, it, vi } from "vitest";
import { getAdminEmails, isAdminEmail } from "@/lib/utils/admin";

describe("getAdminEmails", () => {
  it("splits, trims and lower-cases the comma-separated list", () => {
    vi.stubEnv("ADMIN_EMAILS", " Alice@Example.com , bob@example.com,, ");

    expect(getAdminEmails()).toEqual(["alice@example.com", "bob@example.com"]);
  });

  it("returns no admins when ADMIN_EMAILS is unset", () => {
    vi.stubEnv("ADMIN_EMAILS", undefined);

    expect(getAdminEmails()).toEqual([]);
  });
});

describe("isAdminEmail", () => {
  it("matches case-insensitively", () => {
    vi.stubEnv("ADMIN_EMAILS", "alice@example.com");

    expect(isAdminEmail("ALICE@example.com")).toBe(true);
    expect(isAdminEmail("  alice@example.com ")).toBe(true);
  });

  it("rejects everyone else, and missing emails", () => {
    vi.stubEnv("ADMIN_EMAILS", "alice@example.com");

    expect(isAdminEmail("mallory@example.com")).toBe(false);
    expect(isAdminEmail("alice@example.com.evil.test")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("makes nobody an admin when the list is empty", () => {
    vi.stubEnv("ADMIN_EMAILS", "");

    expect(isAdminEmail("alice@example.com")).toBe(false);
  });
});
