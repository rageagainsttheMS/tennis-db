import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@/auth", () => ({ auth: authMock }));

import {
  UNAUTHORIZED_RESULT,
  getAdminSession,
  isAdminSession,
  requireAdmin,
} from "@/lib/utils/auth-guards";

function session(role?: string): Session {
  return { user: { email: "someone@example.com", role }, expires: "2099-01-01T00:00:00.000Z" } as Session;
}

describe("isAdminSession", () => {
  it("is true only for the admin role", () => {
    expect(isAdminSession(session("admin"))).toBe(true);
    expect(isAdminSession(session("user"))).toBe(false);
    expect(isAdminSession(session())).toBe(false);
    expect(isAdminSession(null)).toBe(false);
    expect(isAdminSession(undefined)).toBe(false);
  });
});

describe("getAdminSession / requireAdmin", () => {
  beforeEach(() => authMock.mockReset());

  it("allows an admin", async () => {
    authMock.mockResolvedValue(session("admin"));

    await expect(getAdminSession()).resolves.toMatchObject({ user: { role: "admin" } });
    await expect(requireAdmin()).resolves.toBeNull();
  });

  it.each([
    ["a signed-in non-admin", session("user")],
    ["an anonymous visitor", null],
  ])("rejects %s", async (_label, value) => {
    authMock.mockResolvedValue(value);

    await expect(getAdminSession()).resolves.toBeNull();
    await expect(requireAdmin()).resolves.toEqual(UNAUTHORIZED_RESULT);
  });
});
