# TennisDB

TennisDB is a full-stack web app for exploring professional men's tennis statistics. It holds match-level data from the 2024 ATP season, about 2,800 matches from Brisbane in January to the ATP Finals in November, together with curated player and tournament profiles. You can search for a player or tournament, open a player's profile and match history, see every match played at a tournament, and look at the serve and break point statistics for a single match.

This is a hobby project. It is deployed to AWS as serverless infrastructure, and the infrastructure is defined in code.

## Features

- **Search on the home page.** Players and tournaments have separate tabs, and suggestions update as you type, with a short delay so a query isn't sent on every keystroke.
- **Player profiles.** Each profile shows the player's bio (country, birthplace, year turned pro, playing hand, backhand style, current ranking) and every match they played, whether they won or lost.
- **Tournament pages.** Each page shows the tournament's details (category, surface, draw size) and all of its matches, which you can filter by round.
- **Match details.** Each match page compares the winner and loser side by side: aces, double faults, first serve %, points won on first and second serve, break points saved/faced, service games, and match length.
- **Authentication.** Users sign in with Google through Auth.js (NextAuth v5). You must be signed in to use the app.
- **Admin pages.** These pages are for creating and editing players and tournaments. A user's role is set when their JWT is created, and only admins see the Admin link in the menu.
- **Light and dark themes**, using Chakra UI and `next-themes`.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Actions), React 19, TypeScript |
| UI | Chakra UI v3, React Icons |
| Database | PostgreSQL on Neon (serverless), connected with `@prisma/adapter-neon` |
| ORM | Prisma 6 |
| Auth | Auth.js / NextAuth v5 (Google OAuth, JWT sessions) |
| Infrastructure | AWS CDK with `cdk-nextjs`: Lambda, CloudFront, S3, VPC with a `fck-nat` NAT instance |
| CI/CD | GitHub Actions (deploys on every push to `main`) |

## Architecture

```
Browser ──► CloudFront ──► Lambda (Next.js SSR + Server Actions) ──► Neon Postgres
                │                         │
                └──► S3 (static assets)   └──► S3 (app bucket, read/write)
```

- **Data access.** Every database read and write is a Next.js Server Action in [lib/actions/](lib/actions/), and they all share one Prisma client set up in [db/prisma.ts](db/prisma.ts).
- **Infrastructure.** [cdk/stack.ts](cdk/stack.ts) defines one CDK stack. It uses `NextjsGlobalFunctions` to run the app on Lambda behind CloudFront. It also creates an encrypted, versioned private S3 bucket that the Lambda function can read and write, and a VPC that uses a t4g.nano `fck-nat` instance instead of a managed NAT Gateway, which costs much less.
- **Linking data.** Matches are connected to players and tournaments by their IDs in the source dataset. `Player.playerMatchId` is matched against `Match.winnerId` and `Match.loserId`. When you create a tournament in the admin pages, the app finds that tournament's `tourneyId` by looking up its name in the imported matches.

## Data model

There are three models, defined in [prisma/schema.prisma](prisma/schema.prisma):

- **Player**: bio and profile information entered through the admin pages, including playing hand (`LEFT`/`RIGHT`), backhand style (`ONEHANDED`/`TWOHANDED`), ranking, and image.
- **Tournament**: name, category (`GS`, `ATPM1000`, `ATP500`, `ATP250`, `DavisCup`, `LaverCup`), surface, draw size, and image.
- **Match**: a single match from the dataset. It includes tournament information, both players' entry details (seed, rank, age, height, country), the score, the round, the match length in minutes, and the full serve statistics for both players. In the database, the columns keep the source CSV's snake_case names (`w_ace`, `l_bpFaced`, and so on), and Prisma maps them to camelCase fields.

## Project structure

```
app/                  Next.js App Router pages
  page.tsx            Home page with player and tournament search
  profile/[id]/       Player profile
  tournament/[id]/    Tournament details
  match/[id]/         Match statistics
  admin/              Pages for creating and editing players and tournaments
  signIn/             Sign-in page
  api/auth/           Auth.js route handlers
components/ui/        Feature components (tables, details views) and shared header/menu
lib/actions/          Server Actions for matches, players, and tournaments
db/                   Prisma client and the CSV import script
prisma/               Schema and a psql \copy command for bulk loading
cdk/                  AWS CDK stack
types/                Shared types and constants
auth.ts               Auth.js configuration
```

## Getting started

### Prerequisites

- Node.js 22
- A Neon (or any other PostgreSQL) database
- A Google OAuth client ID and secret

### Environment variables

Create a `.env` file:

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."            # generate with: npx auth secret
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

### Install and run

```bash
npm install
npx prisma migrate deploy    # or: npx prisma db push
npm run dev
```

The app runs at http://localhost:3000.

### Load match data

Match data comes from `Match.csv` in the project root. There are two ways to load it:

```bash
# Option 1: Node import script (uses Prisma createMany)
node db/importMatches.js

# Option 2: bulk load with psql. See prisma/commands.txt for the \copy command
```

Players and tournaments are not in the CSV. Add them through the admin pages.

## Deployment

The app is deployed to AWS region `ap-southeast-2` by [.github/workflows/deploy.yml](.github/workflows/deploy.yml). On every push to `main`, the workflow installs dependencies, sets up Docker Buildx, and runs `cdk deploy --all`. The workflow needs these repository secrets:

- `AWS_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

To deploy by hand from your machine (requires AWS credentials and the CDK CLI):

```bash
npm run deploy
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Deploy to AWS with CDK |
