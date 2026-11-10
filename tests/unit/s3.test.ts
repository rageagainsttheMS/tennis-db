import { describe, expect, it, vi } from "vitest";

const { getSignedUrlMock } = vi.hoisted(() => ({ getSignedUrlMock: vi.fn() }));
vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: getSignedUrlMock }));

import {
  MAX_UPLOAD_BYTES,
  generatePresignedUrl,
  isAllowedImageKey,
  isUploadFolder,
} from "@/lib/utils/s3";

describe("isUploadFolder", () => {
  it("only allows the known folders", () => {
    expect(isUploadFolder("players")).toBe(true);
    expect(isUploadFolder("tournaments")).toBe(true);
    expect(isUploadFolder("secrets")).toBe(false);
    expect(isUploadFolder("../players")).toBe(false);
    expect(isUploadFolder(undefined)).toBe(false);
    expect(isUploadFolder(42)).toBe(false);
  });
});

describe("isAllowedImageKey", () => {
  it.each([
    "players/1700000000000-0b9c.jpg",
    "tournaments/1700000000000-0b9c.webp",
    "players/old-upload with spaces.png", // older uploads kept the original file name
  ])("allows %s", (key) => {
    expect(isAllowedImageKey(key)).toBe(true);
  });

  it.each([
    ["path traversal", "players/../secrets/db.env"],
    ["a nested path", "players/a/b.jpg"],
    ["a folder outside the allow-list", "private/report.pdf"],
    ["a bare folder", "players/"],
    ["a dot segment", "players/.."],
    ["a backslash", "players\\..\\x.jpg"],
    ["a control character", "players/a\u0000.jpg"],
    ["an over-long key", `players/${"a".repeat(600)}`],
    ["a non-string", 123],
  ])("rejects %s", (_label, key) => {
    expect(isAllowedImageKey(key)).toBe(false);
  });
});

describe("generatePresignedUrl", () => {
  it("generates the key on the server and signs the type and size", async () => {
    vi.stubEnv("AWS_S3_BUCKET_NAME", "images-bucket");
    vi.stubEnv("AWS_REGION", "ap-southeast-2");
    getSignedUrlMock.mockResolvedValue("https://signed.example/put");

    const { signedUrl, key } = await generatePresignedUrl("image/png", 1234, "players");

    expect(signedUrl).toBe("https://signed.example/put");
    expect(key).toMatch(/^players\/\d+-[0-9a-f-]{36}\.png$/);

    const [, command, options] = getSignedUrlMock.mock.calls[0];
    expect(command.input).toMatchObject({
      Bucket: "images-bucket",
      Key: key,
      ContentType: "image/png",
      ContentLength: 1234,
    });
    expect(options.expiresIn).toBeLessThanOrEqual(300);
    expect([...options.signableHeaders]).toEqual(expect.arrayContaining(["content-type", "content-length"]));
  });

  it("caps uploads at 5 MB", () => {
    expect(MAX_UPLOAD_BYTES).toBe(5 * 1024 * 1024);
  });
});
