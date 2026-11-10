# TennisDB: CV Improvements & AWS Redeployment Plan

*Written 2026-11-10 from a review of the code at commit `3f25059`. Part 2 and the items marked **Done** were updated after the dependency upgrade on branch `chore/upgrade-deps`.*

Part 1 is a list of ideas for making this repo more impressive to a hiring manager or reviewer, grouped by priority.
Part 2 gives step-by-step instructions for getting the stack running on AWS again.

> Note: this file lives in `docs/`, which `deploy.yml` lists under `paths-ignore`, so committing it won't start a deploy.

---

## Part 1: Improvements to make it stand out on a CV

### How a reviewer will look at this repo

Most people reviewing a CV project spend about 2–5 minutes on it. Typically they:
1. Open the README and look for a live link and screenshots.
2. Click the live link. **At the moment they can't get past a Google sign-in wall.**
3. Look at a few files, usually auth, a server action, and the infra.
4. Check whether there are tests and CI.

The first tier below covers what those 5 minutes will catch. The later tiers are what turn this from a CRUD app into a project you can talk about in an interview.

---

### Tier 1: Fix what a reviewer will notice (do these first)

#### 1. Let people browse without signing in
**Done:** search, profiles, tournaments and matches are public. Sign-in is only needed for `/admin`. (The demo-admin mode below isn't built.)

At the moment every page requires a Google login, so a recruiter who clicks the demo link stops at the sign-in screen. Make browsing (search, profiles, tournaments, matches) public and keep sign-in for admin features only. You could also add a **"Sign in as demo admin"** mode that has read-only admin views, or that writes to a sandbox and resets every night.

#### 2. Close the authorization gaps
**Done:** `requireAdmin()` guards every data-changing action, the upload route is admin-only with type, size and folder limits, `proxy.ts` and `app/admin/layout.tsx` check the role, admins come from `ADMIN_EMAILS`, and errors are generic.

These are real security bugs, and an experienced reviewer will find them:

| Problem | Where | Fix |
| --- | --- | --- |
| Server Actions `createPlayer`, `updatePlayer`, `createTournament` don't check auth. Server Actions are public POST endpoints, so anyone can call them. | [lib/actions/](../lib/actions/) | Write a `requireAdmin()` helper and call it at the top of every action that changes data. |
| `/api/upload` and `/api/get-image-url` don't check auth. Anyone can get presigned PUT URLs for your bucket. | [app/api/](../app/api/) | Check the session and role. Only allow `image/*` content types and enforce a maximum size, using a presigned POST with `content-length-range`. Sanitise `fileName` and `folder`, because `folder` comes from the client and can contain path segments. |
| `/admin/players` and `/admin/tournaments` check that a session exists but not the role. `/admin/*/create` pages check nothing at all. | [app/admin/](../app/admin/) | Add `middleware.ts` that protects `/admin/:path*` by role. Keep a server-side check in each page/action as well (defence in depth). |
| The admin email is hard-coded in `auth.ts`. | [auth.ts](../auth.ts) | Store roles in the database (Auth.js Prisma adapter with a `User.role` column) or in an `ADMIN_EMAILS` env var. |
| Errors go back to the client as `JSON.stringify(error)`, which can leak Prisma internals. | player actions | Log the full error on the server and return a generic message to the user. |

Once these are fixed you can describe the work in an interview: *"I audited my own app and found that Server Actions were unauthenticated endpoints…"*

#### 3. Add real tests
**Done:** 84 Vitest tests (stats, validation, admin/auth guards, S3 key checks, upload and image-URL routes, Server Actions with Prisma mocked, CDK assertions on the images bucket) and 6 Playwright smoke tests. All run in CI before every deploy, and a post-deploy check hits the live site. Not done yet: integration tests against a real Postgres (Testcontainers or a Neon branch).

`jest.config.js` exists, but Jest isn't installed and there's no `test/` folder. Reviewers will notice that. A testing stack that's in proportion to the project:
- **Vitest + React Testing Library** for components and pure helpers, such as the serve % calculations in `MatchDetails` and the date formatting in `utils.ts`.
- **Integration tests for Server Actions** against a real Postgres, using Testcontainers or a Neon branch made for each CI run. Test that a non-admin gets rejected, that a player links to the right matches, and so on.
- **Playwright e2e** for the main journey (search → profile → match), plus one admin flow.
- **CDK assertion tests**, for example "the bucket blocks public access" and "the Lambda has `DATABASE_URL`". These are cheap and good evidence of infrastructure skills.

#### 4. Make the CI pipeline credible
The current workflow has three problems:
- ~~**It deploys to production on `pull_request`.**~~ **Done:** PRs now only run lint, type-check and `cdk synth`.
- It uses **long-lived IAM access keys**.
- ~~It doesn't lint, type-check, test, or build before deploying.~~ **Done:** lint, type-check, unit tests, build and e2e all gate the deploy.

A better setup:
- `ci.yml` runs on every PR: `npm ci` → `lint` → `tsc --noEmit` → tests → `next build` → `cdk synth` + `cdk diff`. Post the diff as a PR comment.
- `deploy.yml` runs on push to `main` only. It authenticates to AWS through **GitHub OIDC** (no stored keys), uses a GitHub `production` environment, and pins `aws-cdk` to a fixed version instead of `@latest`.
- Add Dependabot or Renovate, and CodeQL.

#### 5. Clean up the codebase
- **Done:** the CDK v1 packages and `@prisma/extension-accelerate` are removed, `aws-cdk-lib`/`constructs`/`aws-cdk` are explicit dependencies, and `@prisma/client` is a runtime dependency. Still to do: replace `moment` and drop one of `ts-node`/`tsx`. Original note: **Remove dependencies you don't use or that are wrong:** the CDK **v1** packages (`@aws-cdk/aws-cloudfront`, `aws-s3`, `aws-s3-deployment`), which are deprecated and mixed with v2; `@prisma/extension-accelerate`; `moment` (use `Intl` or `date-fns`); one of `ts-node`/`tsx`. Add `aws-cdk-lib` and `constructs` as explicit devDependencies, because right now they only arrive as peers of `cdk-nextjs`. Move `@prisma/client` from devDependencies to dependencies.
- **`.github/instructions/instructions.md`** was copied from a template. It mentions Solidity, Wagmi, Viem, TanStack Query and `next-safe-action`, none of which this project uses. Rewrite it for this stack or delete it.
- **Migrations:** there are 18 migrations with names like `update`, `made` and `fix`. The data can be re-imported from the CSV, so squash them into a single clean `init` baseline.
- **Done:** the import script is now `db/importMatches.ts` and runs with `npm run db:seed` (Prisma `seed` config). The README still describes the old `node db/importMatches.js` command.
- **Done:** `error.tsx`, `loading.tsx` and a `/api/health` route were added.
- Validate all action and route inputs with **Zod**, and return a typed `ActionResult` consistently.

---

### Tier 2: Features that show engineering depth

Pick 2–3 of these. Each one gives you a story for an interview.

#### Data engineering
- **Ingest multiple seasons automatically.** At the moment there's one hand-loaded 2024 CSV, and players and tournaments are entered by hand. Build an ingestion pipeline that pulls the open ATP match datasets for a range of years (check the dataset's licence and credit it in the README). Create Player and Tournament rows from the data instead of through admin forms, and make reruns safe (idempotent upserts). Run it on a schedule with **EventBridge → Lambda**, or as a GitHub Actions cron.
- **Fix the data model.** `Match.winnerId`/`loserId` aren't foreign keys, `tourneyDate` is a string, `Player.age` is a string (it should be computed from date of birth), and **there are no indexes** on `winner_id`, `loser_id` or `tourney_id`, the columns every profile and tournament page filters on. Add proper relations, typed columns and indexes, then show the before/after `EXPLAIN ANALYZE` in the README.
- **Paginate** match lists. Profiles currently load every match a player has.

#### Analytics features (the "interesting" part of the project)
- **Head-to-head page**: pick two players and see their record, broken down by surface, with match history.
- **Player stats dashboard**: win % by surface and by round, serve stat trends over a season, record against top-10 players. Build these with SQL aggregates and window functions, and cache them in materialised views.
- **Elo rating system**: compute surface-specific Elo ratings from match history, plot them over time, and compare them with the official rankings. This is the strongest single feature you could add. It's algorithmic, testable, and easy to talk about.
- **Leaderboards**: most aces, best break point conversion, longest matches, and so on, all filterable.
- **Fuzzy search** with Postgres `pg_trgm`, so that "djokovic" still finds "Novak Djokovic" when misspelled.
- *(Optional, fashionable)* **Natural-language queries**, e.g. "Who hit the most aces on grass in 2024?" An LLM turns the question into a **constrained, read-only** query over a safe view. Treat the guardrails as part of the design: allow-listed tables, a read-only DB role, and timeouts.

#### Performance
- Match data almost never changes, so use static generation / ISR (`generateStaticParams`, `revalidate`) for profile, tournament and match pages. Measure Lighthouse scores before and after.
- Serve images from **CloudFront with Origin Access Control** instead of making a presigned GET request for every image view. Use `next/image`.

---

### Tier 3: Production readiness and infrastructure maturity

- **Custom domain + HTTPS.** The Route 53 and ACM code is already written in `cdk/stack.ts`, just commented out.
- **Secrets management.** Keep secrets in SSM Parameter Store or Secrets Manager rather than baking them into the image (see Part 2).
- **Observability.** Use structured logging, CloudWatch alarms on Lambda errors, 5xx rates and duration, plus Sentry or X-Ray tracing.
- **Multiple environments.** Parameterise the stack by stage (`dev`, `prod`). Use a Neon branch for each environment, and possibly for each PR.
- **Cost controls.** Define an AWS Budget alarm in CDK, and document the monthly cost (see Part 2). Being aware of cost is something reviewers like to see.
- **Run `cdk-nag`** (the AWS Solutions checks) in CI.
- Change `RemovalPolicy.DESTROY` / `autoDeleteObjects` on the bucket to `RETAIN` for prod. Add a lifecycle rule for old object versions.
- Add **accessibility** checks (axe in Playwright) and mobile responsiveness.

---

### Presentation (low effort, high return)

- README: put a **live demo link** at the top, followed by **screenshots or a GIF**, an architecture diagram (Mermaid renders on GitHub), CI and coverage badges, and a **"Design decisions & trade-offs"** section. For example: why the Lambda runs without a VPC, why Neon, and why Server Actions instead of a REST API.
- A short `docs/adr/` folder with 3–4 Architecture Decision Records.
- Use PRs and conventional commits from now on, even when working alone. A history of small reviewed PRs with green CI reads much better than direct pushes to `main`.

#### Example CV bullets (once the work is done)
- *Built a full-stack tennis analytics platform (Next.js 15, TypeScript, PostgreSQL/Prisma) holding N seasons and X k matches, with surface-adjusted Elo ratings and head-to-head analysis.*
- *Defined serverless AWS infrastructure in CDK (Lambda, CloudFront, S3, DynamoDB). Migrated from container-image Lambdas with EFS and a VPC to zip Lambdas without a VPC, which removed every fixed monthly cost.*
- *Set up CI/CD with GitHub Actions and OIDC role assumption, with unit, integration (Testcontainers) and Playwright e2e tests gating every deploy.*
- *Added indexes and caching that brought p95 profile page load from A ms to B ms.* (Measure it before you claim it.)

### Suggested order
1. Tier 1 #2 (security) and #5 (cleanup, health route), because they block deploying safely.
2. Redeploy (Part 2).
3. Public browsing (#1) → CI (#4) → tests (#3).
4. Data model + ingestion → Elo / head-to-head.
5. README polish, custom domain, observability.

---

## Part 2: Redeploying to AWS

*Updated after the dependency upgrade (Next.js 16.4, Prisma 7, cdk-nextjs 0.7).*

### How the setup works now
- `cdk.json` runs `npx tsx cdk/stack.ts`, which creates a single stack named **`nextjs`** in `ap-southeast-2`.
- During `cdk synth`, cdk-nextjs 0.7 runs `npm run build` (`prisma generate` + `next build`) through the Next.js **Deployment Adapter API**. It packages the output as a **zip Lambda**, so **Docker isn't needed**. The stack contains:
  - the server Lambda (Node 22) behind a Lambda Function URL and **CloudFront**
  - an S3 bucket for static assets, plus an S3 bucket and a **DynamoDB table** for the Next.js cache and revalidation data
  - a small post-deploy Lambda that prunes old build files
  - our own private S3 bucket for player and tournament images
- **There is no VPC, NAT instance or EFS any more.** The old setup needed them only so the Lambda could mount EFS. The Lambda now runs outside a VPC and reaches Neon and Google OAuth directly.
- The database is still external: Neon Postgres.

### What's already fixed

| Old blocker | Status |
| --- | --- |
| `/api/health` route missing | Added. cdk-nextjs 0.7 no longer health-checks Lambdas, but the route is useful for smoke tests and uptime monitors |
| `s3.ts` hard-coded credentials and lost the Lambda session token | Fixed: `new S3Client({})` uses the default credential chain |
| Secrets baked into Docker image layers | No longer applies, because there's no Docker image. See the next section for how `.env` is handled now |
| Bucket name not passed to the Lambda | `AWS_S3_BUCKET_NAME` is now set by the stack |
| CI deployed on `pull_request` | PRs now only lint, type-check and synth. Deploying happens only on push to `main` |

### How runtime settings reach the Lambda

cdk-nextjs copies **`.env` and `.env.production`** from the project folder into the Lambda package and loads them at startup. A variable set directly on the function overrides them. In practice:

- **Deploy from your machine:** your local `.env` is uploaded with the app. It works, but every value in it ends up in the Lambda package, including anything you only use locally. If you deploy locally, keep a clean `.env.production` with the production values only.
- **Deploy from GitHub Actions:** there's no `.env`, so the workflow writes `.env.production` from repository secrets before `cdk synth` (the "Write runtime environment" step in [deploy.yml](../.github/workflows/deploy.yml)). It only does this on push to `main`, never for PRs.

The values sit in the Lambda package and the CDK assets bucket, encrypted at rest but readable by anyone with access to those resources. That's acceptable for a hobby deploy. The better approach, and a good CV item (Tier 3), is to store them in SSM Parameter Store and load them at cold start. That needs `ssm:GetParameters` on the function and a small loader in `instrumentation.ts`, or the AWS Parameters and Secrets Lambda Extension.

### Step-by-step

#### 0. Check what's still in the account
```bash
aws sts get-caller-identity                       # confirm the right account (…7682)
aws cloudformation list-stacks --region ap-southeast-2 \
  --query "StackSummaries[?StackStatus!='DELETE_COMPLETE'].[StackName,StackStatus]"
```
- **If the old `nextjs` stack (cdk-nextjs 0.4) still exists**, deploying the new code updates it in place. CloudFormation will:
  - **replace the server Lambda**, because an Image-type function can't become a Zip one. The Function URL and log group are replaced too, and the old log group is kept.
  - **delete the VPC, the fck-nat instance and its Elastic IP, and the EFS file system**
  - create the new cache bucket and DynamoDB table

  Run `npx cdk diff` first to see the full list. Afterwards, check the EC2 and EFS consoles for anything left behind (`aws efs describe-file-systems`, `aws ec2 describe-addresses`), because retained resources keep costing money.
- **If the stack is in `ROLLBACK_COMPLETE` or `UPDATE_ROLLBACK_FAILED`**, delete it first. **Back up the images bucket before you do:** the bucket uses `autoDeleteObjects`, so destroying the stack deletes every uploaded player and tournament image.
  ```bash
  aws s3 sync s3://nextjs-nextjs-bucket-<account> ./bucket-backup
  ```
- **If `CDKToolkit` (the bootstrap stack) is missing**, you'll bootstrap in step 3.
- The images bucket name is deterministic (`nextjs-nextjs-bucket-<account>`). If a bucket with that name survived an earlier destroy, a fresh deploy fails, so check with `aws s3 ls | grep nextjs`.

#### 1. Check that the Neon database is still there
- Log in to Neon and confirm the project exists. Free-tier compute suspends when idle, which is fine, but inactive projects can be removed.
- If you need a new one, create a project in **AWS ap-southeast-2 (Sydney)** to keep latency low, copy the **pooled** connection string into `.env`, then:
  ```bash
  npx prisma migrate deploy    # Prisma 7 reads the URL via prisma.config.ts
  npm run db:seed              # imports Match.csv
  ```
  Then recreate the Player and Tournament rows through the admin UI. This manual step is a good argument for the ingestion pipeline in Tier 2.

#### 2. Add the GitHub repository secrets
In GitHub, go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | `npx auth secret` output |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | from your Google OAuth client |
| `ADMIN_EMAILS` | comma-separated admin emails (if unset, nobody is an admin) |
| `AWS_ACCOUNT_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | already exist. Replace the keys with OIDC in step 7 |

Values are written as double-quoted dotenv lines, so a value can't contain a literal double quote.

#### 3. Bootstrap CDK (one-off per account and region)
```bash
npx cdk bootstrap aws://<ACCOUNT_ID>/ap-southeast-2
```

#### 4. Deploy
**From your machine.** No Docker is needed. On Windows, run these from **PowerShell**, not Git Bash: cdk-nextjs shells out to `tar`, and Git Bash's GNU tar fails on `C:\` paths.
```powershell
npm ci
npx cdk synth --quiet   # runs the full Next build; catches errors without touching AWS
npx cdk diff
npx cdk deploy
```
Make sure the `.env` (or `.env.production`) you deploy with contains `AUTH_TRUST_HOST=true` and `ADMIN_EMAILS`.

**Or from CI.** Merge to `main`. The workflow lints, type-checks, writes `.env.production`, synths and deploys.

When it finishes, copy the **CloudFront domain** (`dxxxx.cloudfront.net`) from the stack outputs. cdk-nextjs exposes the app URL as `NextjsGlobalFunctions.url`.

#### 5. Configure Google OAuth and CORS for the new URL
In Google Cloud Console → APIs & Services → Credentials → your OAuth client:
- Authorised JavaScript origin: `https://dxxxx.cloudfront.net`
- Authorised redirect URI: `https://dxxxx.cloudfront.net/api/auth/callback/google`

Auth.js runs behind CloudFront, so it needs `AUTH_TRUST_HOST=true`. The CI workflow already sets it. Alternatively, set `AUTH_URL=https://dxxxx.cloudfront.net`.

In [cdk/stack.ts](../cdk/stack.ts), add the CloudFront domain to the images bucket's CORS `allowedOrigins`, which today only contains `http://localhost:3000`. Otherwise browser uploads to presigned URLs fail in production. Redeploy after the change.

#### 6. Smoke test
- `curl https://dxxxx.cloudfront.net/api/health` → `{"status":"ok"}`
- Browse: search → profile → match page.
- Sign in as an admin → upload a player image. This tests the S3 role permissions and CORS.
- Sign in as a non-admin → `/admin/players` should redirect to `/`.
- If something fails: CloudWatch → Log groups → `/aws/lambda/nextjs-...` (the server function).

#### 7. Replace the IAM access keys with OIDC (recommended)
The workflow still authenticates with long-lived access keys.
1. Create a GitHub OIDC identity provider in IAM: `token.actions.githubusercontent.com`, audience `sts.amazonaws.com`.
2. Create a role whose trust policy is limited to `repo:rageagainsttheMS/tennis-db:ref:refs/heads/main`. CDK deploys only need permission to assume the bootstrap roles: `sts:AssumeRole` on `arn:aws:iam::<ACCOUNT>:role/cdk-*`.
3. In `deploy.yml`, add `permissions: { id-token: write, contents: read }` and swap the credentials step for:
   ```yaml
   - uses: aws-actions/configure-aws-credentials@v4
     with:
       role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-deploy
       aws-region: ap-southeast-2
   ```
4. Delete the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets and deactivate that IAM user's keys.

#### 8. Optional: custom domain
Uncomment the hosted zone, certificate and DNS record code in `cdk/stack.ts`. The certificate for CloudFront must be in **us-east-1**: either use `crossRegionReferences` with a separate us-east-1 stack, or create it there by hand and import it by ARN. Pass it through `overrides.nextjsDistribution`. A custom certificate also clears the `minimumProtocolVersion` synth warning. Then add the new domain to the Google OAuth origins and redirects and to the bucket CORS settings.

### Expected running cost (approximate, low traffic)

| Item | ~USD / month |
| --- | --- |
| Lambda, CloudFront, S3, DynamoDB (on-demand) | ~$0–1 (mostly free tier) |
| CloudWatch logs | < $0.50 |
| Neon free tier | $0 |
| **Total** | **≈ $0–2** |

Removing the VPC took away the fixed costs: about $3 for the NAT instance, $3.65 for its public IPv4 address, and the EFS storage. Set a budget alarm anyway, either in CDK or with `aws budgets create-budget`, at about $10/month.
To shut everything down: `npx cdk destroy`. Back up the images bucket first (see step 0). Afterwards, check CloudWatch log groups for anything left behind.
