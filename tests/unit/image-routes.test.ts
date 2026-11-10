import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { getAdminSessionMock, generatePresignedUrlMock, generateViewPresignedUrlMock } = vi.hoisted(() => ({
  getAdminSessionMock: vi.fn(),
  generatePresignedUrlMock: vi.fn(),
  generateViewPresignedUrlMock: vi.fn(),
}));

vi.mock("@/lib/utils/auth-guards", () => ({ getAdminSession: getAdminSessionMock }));
vi.mock("@/lib/utils/s3", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/utils/s3")>()),
  generatePresignedUrl: generatePresignedUrlMock,
  generateViewPresignedUrl: generateViewPresignedUrlMock,
}));

import { POST as upload } from "@/app/api/upload/route";
import { POST as getImageUrl } from "@/app/api/get-image-url/route";

function jsonRequest(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validUpload = { fileType: "image/jpeg", fileSize: 1000, folder: "players" };

describe("POST /api/upload", () => {
  beforeEach(() => {
    getAdminSessionMock.mockReset();
    generatePresignedUrlMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 401 and signs nothing for non-admins", async () => {
    getAdminSessionMock.mockResolvedValue(null);

    const res = await upload(jsonRequest("/api/upload", validUpload));

    expect(res.status).toBe(401);
    expect(generatePresignedUrlMock).not.toHaveBeenCalled();
  });

  describe("as an admin", () => {
    beforeEach(() => getAdminSessionMock.mockResolvedValue({ user: { role: "admin" } }));

    it("returns a signed URL and server-generated key", async () => {
      generatePresignedUrlMock.mockResolvedValue({ signedUrl: "https://signed", key: "players/1-x.jpg" });

      const res = await upload(jsonRequest("/api/upload", validUpload));

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ signedUrl: "https://signed", key: "players/1-x.jpg" });
      expect(generatePresignedUrlMock).toHaveBeenCalledWith("image/jpeg", 1000, "players");
    });

    it.each([
      ["a non-image type", { ...validUpload, fileType: "text/html" }],
      ["an SVG (can carry scripts)", { ...validUpload, fileType: "image/svg+xml" }],
      ["a file over 5 MB", { ...validUpload, fileSize: 5 * 1024 * 1024 + 1 }],
      ["an empty file", { ...validUpload, fileSize: 0 }],
      ["a fractional size", { ...validUpload, fileSize: 1.5 }],
      ["an unknown folder", { ...validUpload, folder: "../../etc" }],
    ])("returns 400 for %s", async (_label, body) => {
      const res = await upload(jsonRequest("/api/upload", body));

      expect(res.status).toBe(400);
      expect(generatePresignedUrlMock).not.toHaveBeenCalled();
    });

    it("returns 400 for a malformed JSON body", async () => {
      const res = await upload(jsonRequest("/api/upload", "{not json"));

      expect(res.status).toBe(400);
    });

    it("hides S3 errors behind a generic 500", async () => {
      generatePresignedUrlMock.mockRejectedValue(new Error("AccessDenied: arn:aws:iam::123:role/secret"));

      const res = await upload(jsonRequest("/api/upload", validUpload));

      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("arn:aws");
    });
  });
});

describe("POST /api/get-image-url", () => {
  beforeEach(() => {
    generateViewPresignedUrlMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("signs keys in the image folders without requiring sign-in", async () => {
    generateViewPresignedUrlMock.mockResolvedValue({ presignedUrl: "https://signed/get" });

    const res = await getImageUrl(jsonRequest("/api/get-image-url", { key: "players/1-x.jpg" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ presignedUrl: "https://signed/get" });
  });

  it.each(["players/../../.env", "private/x.jpg", "", 5])("refuses to sign %o", async (key) => {
    const res = await getImageUrl(jsonRequest("/api/get-image-url", { key }));

    expect(res.status).toBe(400);
    expect(generateViewPresignedUrlMock).not.toHaveBeenCalled();
  });
});
