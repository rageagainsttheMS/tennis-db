import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Playwright specs live in e2e/ and run with `npm run test:e2e`.
    exclude: ["e2e/**", "node_modules/**"],
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: "v8",
      include: ["lib/**", "app/api/**", "cdk/images-bucket.ts"],
      exclude: ["lib/hooks/**"],
    },
  },
});
