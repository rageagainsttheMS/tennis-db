<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Versions that differ from what you may expect

| Package | Version | What changed |
| --- | --- | --- |
| Next.js | 16.4 | Turbopack by default. Middleware is `proxy.ts`. `next lint` is gone. `params`/`searchParams`/`cookies()`/`headers()` are async only |
| React | 19.3 | `eslint-plugin-react-hooks` v7 enforces React Compiler rules (e.g. no components defined during render) |
| Prisma | 7.10 | Generated client in `generated/prisma`, connection URL in `prisma.config.ts`, driver adapter required |
| Chakra UI | 3.x | Compound components (`Dialog.Root`, `Field.Root`), not the v2 `useDisclosure`/`FormControl` style. Docs: https://chakra-ui.com/docs |
| Auth.js | 5.0 beta | Call `auth()` from `@/auth`; `getServerSession` is gone. Docs: https://authjs.dev |
| cdk-nextjs | 0.7 | Zip Lambda via the Next.js Deployment Adapter. No Docker, EFS or VPC, and no `output: 'standalone'` |
| TypeScript / ESLint | 6.0 / 9 | Held back on purpose: `typescript-eslint` doesn't support TS 7, and the Next lint plugins don't support ESLint 10 |

## Project overview

TennisDB is an app for browsing 2024 ATP match statistics. It has player profiles, tournament pages and per-match serve stats, plus admin pages for creating players and tournaments. The data lives in Neon Postgres and is accessed through Prisma. The app is deployed to AWS (Lambda + CloudFront) with CDK. [README.md](README.md) has the full description.

## Commands

```bash
npm run dev                 # dev server at http://localhost:3000
npm run build               # prisma generate + next build
npm run lint                # eslint . (flat config in eslint.config.mjs)
npm run typecheck           # tsc --noEmit
npx prisma migrate dev      # after editing prisma/schema.prisma (no longer runs generate)
npx prisma generate         # regenerate the client into generated/prisma
npm run db:seed             # load seed-files/*.csv into DATABASE_URL (db/seed/load.ts); add -- --season 2026 for one season
npm test                    # unit tests (Vitest)
npm run test:e2e            # Playwright smoke tests against the production build
npm run db:seed:dry-run     # convert seed-files/*.csv and print a report; never touches the database
npx cdk synth               # validate infra without deploying (runs next build itself)
```

- `npm install` runs `prisma generate` (postinstall). `generated/` is gitignored, so after a fresh clone, run that or `npm run build` before type-checking.
- **Tests:** `npm test` (Vitest: unit, Server Action and CDK tests in `tests/`) and `npm run test:e2e` (Playwright smoke tests in `e2e/`, after `npm run build`). Add or update tests with every behaviour change, and run `npm run lint`, `npm run typecheck` and `npm test` before calling work done.
- **Windows:** run Vitest from PowerShell or from a shell whose working directory starts with an upper-case `C:\`. With a lower-case `c:\` path, Vitest loads twice and every suite fails with `Cannot read properties of undefined (reading 'config')`.
- **Windows:** run `cdk synth`/`cdk deploy` from PowerShell, not Git Bash. cdk-nextjs shells out to `tar`, and Git Bash's GNU tar reads `C:\…` as a remote host and fails.

## Layout

| Path | Contents |
| --- | --- |
| `app/` | App Router pages. `admin/` holds the player and tournament lists (role-checked in `admin/layout.tsx`); bios are edited on the profile and tournament pages. `api/` holds the auth, upload, image-URL and health routes |
| `proxy.ts` | Next 16 middleware. Redirects non-admins away from `/admin/:path*` |
| `components/ui/` | Feature components. `provider.tsx`, `color-mode.tsx`, `toaster.tsx` and `tooltip.tsx` are Chakra CLI snippets |
| `lib/actions/` | Server Actions (`"use server"`). All DB reads and writes go through these |
| `lib/utils/auth-guards.ts` | `requireAdmin()` and `getAdminSession()` for server code |
| `lib/validation/` | Zod schemas and `parseInput()` for action inputs |
| `lib/utils/s3.ts`, `lib/hooks/` | Presigned S3 upload/view helpers |
| `db/prisma.ts` | The single shared Prisma client (Neon serverless adapter + `ws`) |
| `prisma/`, `prisma.config.ts` | Schema, migrations, and the Prisma CLI config (datasource URL, seed command) |
| `generated/prisma/` | Generated Prisma client. Never edit or commit it |
| `cdk/stack.ts` | The single CDK stack (`cdk-nextjs` `NextjsGlobalFunctions` + an S3 bucket for images) |
| `types/` | Shared types and `constants.ts` (routes, roles, enum labels) |
| `auth.ts` | Auth.js config. Google provider; role is set in the `jwt` callback from `ADMIN_EMAILS` |

Imports use the `@/` alias for the repo root, e.g. `@/lib/actions/player.actions`.

## Conventions

- Prefer Server Components. Add `"use client"` only for components that need interactivity.
- Define components at module level, never inside another component (the `react-hooks/static-components` lint rule fails otherwise).
- Read and write data in `lib/actions/*.actions.ts`, never with Prisma calls in components. Actions that change data return `ActionResult` (`{ success, message, id? }`) from `@/types` rather than throwing.
- Import the client from `@/db/prisma`, and import Prisma types and enums from `@/generated/prisma/client`, **not** `@prisma/client`. Never create a new `PrismaClient`.
- Validate action inputs with the Zod schemas in `lib/validation/`. TypeScript types aren't enough, because Server Actions accept any JSON.
- Use Chakra UI v3 for UI and styling. Don't add Tailwind or another component library.
- Players, tournaments and matches come from the tennisdata.app season files, loaded by `db/seed/`. Players are keyed by `sourceId`, tournaments by a slug, and matches by `sourceMatchId`, with foreign keys between them. Admins only edit bio fields (`lib/validation/`); never let a client set the source-owned fields (`sourceId`, `name`, level, surface).
- Display a player with `displayName()` (`lib/utils/utils.ts`): the admin's full name if set, otherwise the source's abbreviated name.
- Changing how the seed files are converted? Update `db/seed/normalize.ts` or `tournaments.ts`, add a test in `tests/unit/seed-normalize.test.ts`, and check `npm run db:seed:dry-run` before loading. Load into a Neon branch before production.
- Don't hand-edit or delete existing migrations. Change `schema.prisma` and generate a new migration.
- Don't use the edge runtime (`export const runtime = "edge"`). cdk-nextjs 0.7 fails the build on it.

## Security

- **Every Server Action and API route that changes data must start with `requireAdmin()`** (or check `getAdminSession()` in a route). Server Actions are public POST endpoints, so hiding a button or relying on `proxy.ts` doesn't protect anything.
- Don't put `"use server"` on helper modules. Everything exported from such a file becomes a public endpoint.
- Never commit `.env*` files or log secrets. Don't return raw Prisma or AWS errors to the client.
- Required variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS` (comma-separated; if unset, nobody is an admin). The deployed Lambda also gets `AWS_S3_BUCKET_NAME` from the CDK stack.
- cdk-nextjs copies a local `.env` into the Lambda package. A deploy from your machine uploads those values to Lambda, and a CI deploy (no `.env`) gets none of them.

## Deployment

- **Every push to `main` runs `cdk deploy` to production** (`.github/workflows/deploy.yml`, region `ap-southeast-2`). Work on a branch, and never push to `main` or run `cdk deploy`/`npm run deploy` unless asked.
- Changes to `README.md` and `docs/**` don't trigger a deploy.
- Deploying no longer needs Docker. cdk-nextjs runs `npm run build` itself during synth.
