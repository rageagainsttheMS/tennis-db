import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx db/seed/load.ts",
  },
  datasource: {
    // process.env instead of env() so `prisma generate` still works in CI and
    // Docker builds where DATABASE_URL isn't set. Migrate commands need it.
    url: process.env.DATABASE_URL ?? "",
  },
});
