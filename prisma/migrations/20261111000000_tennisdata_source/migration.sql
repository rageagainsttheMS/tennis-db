-- Switch from the 2024 Match.csv (Jeff Sackmann format) to the tennisdata.app season files.
--
-- Match rows are replaced, not converted: the two sources share no IDs. Players and tournaments
-- are converted in place, so the bios and images entered by an admin survive. Every row the seed
-- loader can't match to the new source is deleted. Production had 3 players and 4 tournaments,
-- all mapped below. A database with none of them runs the same statements and maps nothing.
-- Afterwards, run `npm run db:seed` to load the matches.

-- New enums --------------------------------------------------------------------------------------

CREATE TYPE "Round" AS ENUM ('F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'RR', 'PO', 'TIE', 'BR');

CREATE TYPE "MatchStatus" AS ENUM ('COMPLETED', 'RETIRED', 'WALKOVER', 'AWARDED');

ALTER TYPE "TournamentType" ADD VALUE 'Finals';
ALTER TYPE "TournamentType" ADD VALUE 'NextGen';
ALTER TYPE "TournamentType" ADD VALUE 'TeamCup';
ALTER TYPE "TournamentType" ADD VALUE 'Olympics';

-- Matches: drop the old table (nothing references it) ---------------------------------------

DROP TABLE "Match";

-- Players ------------------------------------------------------------------------------------

ALTER TABLE "Player"
  ADD COLUMN "sourceId" TEXT,
  ADD COLUMN "fullName" TEXT;

-- The admin-entered name is the full name. `name` becomes the source's abbreviated name below.
UPDATE "Player" SET "fullName" = "name";

-- Old Match.csv player IDs -> tennisdata.app player IDs.
UPDATE "Player" AS p
SET "sourceId" = m.source_id, "name" = m.source_name
FROM (VALUES
  ('A0E2', '115728', 'Alcaraz C.'),
  ('S0AG', '225761', 'Sinner J.'),
  ('D643', '181695', 'Djokovic N.')
) AS m(old_id, source_id, source_name)
WHERE p."playerMatchId" = m.old_id;

DELETE FROM "Player" WHERE "sourceId" IS NULL;

DROP INDEX "Player_playerMatchId_key";

ALTER TABLE "Player"
  DROP COLUMN "playerMatchId",
  -- Ranks now come from the matches (the player's most recent match).
  DROP COLUMN "rank",
  ALTER COLUMN "sourceId" SET NOT NULL,
  ALTER COLUMN "hand" DROP NOT NULL,
  ALTER COLUMN "backHand" DROP NOT NULL,
  ALTER COLUMN "country" DROP NOT NULL,
  ALTER COLUMN "birthPlace" DROP NOT NULL,
  ALTER COLUMN "turnedPro" DROP NOT NULL,
  ALTER COLUMN "age" DROP NOT NULL,
  ALTER COLUMN "profile" DROP NOT NULL,
  ALTER COLUMN "image" DROP NOT NULL;

-- Empty strings were placeholders for "not entered".
UPDATE "Player" SET
  "nickName" = NULLIF("nickName", ''),
  "country" = NULLIF("country", ''),
  "birthPlace" = NULLIF("birthPlace", ''),
  "turnedPro" = NULLIF("turnedPro", ''),
  "age" = NULLIF("age", ''),
  "profile" = NULLIF("profile", ''),
  "image" = NULLIF("image", '');

CREATE UNIQUE INDEX "Player_sourceId_key" ON "Player"("sourceId");
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- Tournaments --------------------------------------------------------------------------------

-- Old Match.csv tourney IDs (one per 2024 edition) -> event slugs used by the seed loader.
UPDATE "Tournament" AS t
SET "id" = m.slug
FROM (VALUES
  ('2024-580', 'australian-open'),
  ('2024-520', 'roland-garros'),
  ('2024-540', 'wimbledon'),
  ('2024-560', 'us-open')
) AS m(old_id, slug)
WHERE t."id" = m.old_id;

DELETE FROM "Tournament"
WHERE "id" NOT IN ('australian-open', 'roland-garros', 'wimbledon', 'us-open');

ALTER TABLE "Tournament"
  ADD COLUMN "indoor" BOOLEAN NOT NULL DEFAULT false,
  ALTER COLUMN "image" DROP NOT NULL,
  ALTER COLUMN "drawSize" DROP NOT NULL,
  ALTER COLUMN "surface" DROP NOT NULL;

UPDATE "Tournament" SET
  "image" = NULLIF("image", ''),
  "surface" = NULLIF("surface", ''),
  "description" = NULLIF("description", ''),
  "drawSize" = NULLIF("drawSize", 0);

-- Matches: the new table ---------------------------------------------------------------------

CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "sourceMatchId" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "tournamentDetail" TEXT,
    "round" "Round" NOT NULL,
    "surface" TEXT,
    "indoor" BOOLEAN NOT NULL DEFAULT false,
    "status" "MatchStatus" NOT NULL,
    "bestOf" INTEGER NOT NULL,
    "score" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    "winnerRank" INTEGER,
    "loserRank" INTEGER,
    "winnerRankingPoints" INTEGER,
    "loserRankingPoints" INTEGER,
    "winnerSets" INTEGER,
    "loserSets" INTEGER,
    "winnerAces" INTEGER,
    "loserAces" INTEGER,
    "winnerDoubleFaults" INTEGER,
    "loserDoubleFaults" INTEGER,
    "winnerServicePointsWonPct" INTEGER,
    "loserServicePointsWonPct" INTEGER,
    "winnerReturnPointsWonPct" INTEGER,
    "loserReturnPointsWonPct" INTEGER,
    "winnerBreakPointsWonPct" INTEGER,
    "loserBreakPointsWonPct" INTEGER,
    "winnerBreakPointsSavedPct" INTEGER,
    "loserBreakPointsSavedPct" INTEGER,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Match_sourceMatchId_key" ON "Match"("sourceMatchId");
CREATE INDEX "Match_winnerId_playedAt_idx" ON "Match"("winnerId", "playedAt");
CREATE INDEX "Match_loserId_playedAt_idx" ON "Match"("loserId", "playedAt");
CREATE INDEX "Match_tournamentId_season_idx" ON "Match"("tournamentId", "season");
CREATE INDEX "Match_season_idx" ON "Match"("season");
CREATE INDEX "Match_playedAt_idx" ON "Match"("playedAt");

ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
