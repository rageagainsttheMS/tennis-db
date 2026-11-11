/**
 * Loads the tennisdata.app season files into the database. Safe to re-run: matches are upserted
 * by their source ID, so match IDs (and /match/<id> links) stay the same between loads.
 *
 *   npm run db:seed                     every season in seed-files/, oldest first
 *   npm run db:seed -- --season 2026    one season, e.g. to pick up new results
 *   npm run db:seed -- --dir path/to/files
 *
 * It writes to the database in DATABASE_URL. Check which one that is before running it.
 * Run `npm run db:seed:dry-run` first to see what would be loaded.
 */
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "../prisma";
import { listSeasonFiles, readSeasonFile } from "./files";
import { normalizeRow, type NormalizedMatch } from "./normalize";
import { chunk, planMatches, type PlannedMatch, type PlannedTournament } from "./plan";

/** 32 columns per row, so 500 rows is 16,000 parameters (Postgres allows 65,535). */
const BATCH_SIZE = 500;

const MATCH_COLUMNS = [
  "sourceMatchId", "season", "playedAt", "tournamentId", "tournamentDetail", "round", "surface",
  "indoor", "status", "bestOf", "score", "winnerId", "loserId", "winnerRank", "loserRank",
  "winnerRankingPoints", "loserRankingPoints", "winnerSets", "loserSets", "winnerAces", "loserAces",
  "winnerDoubleFaults", "loserDoubleFaults", "winnerServicePointsWonPct", "loserServicePointsWonPct",
  "winnerReturnPointsWonPct", "loserReturnPointsWonPct", "winnerBreakPointsWonPct",
  "loserBreakPointsWonPct", "winnerBreakPointsSavedPct", "loserBreakPointsSavedPct",
] as const;

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

function databaseHost(): string {
  try {
    return new URL(process.env.DATABASE_URL ?? "").host || "(not set)";
  } catch {
    return "(invalid DATABASE_URL)";
  }
}

/** Insert new tournaments. Update an existing one only from a season at least as recent as its matches. */
async function saveTournaments(tournaments: PlannedTournament[]) {
  const latest = await prisma.match.groupBy({ by: ["tournamentId"], _max: { season: true } });
  const latestSeason = new Map(latest.map((row) => [row.tournamentId, row._max.season ?? 0]));

  for (const { season, ...tournament } of tournaments) {
    const isCurrent = season >= (latestSeason.get(tournament.id) ?? 0);
    await prisma.tournament.upsert({
      where: { id: tournament.id },
      create: tournament,
      // Only source-owned fields. Description, image and draw size belong to the admin.
      update: isCurrent
        ? { name: tournament.name, tournamentType: tournament.tournamentType, surface: tournament.surface, indoor: tournament.indoor }
        : {},
    });
  }
}

/** Insert new players and return a map of source ID -> database ID. */
async function savePlayers(players: { sourceId: string; name: string }[]) {
  for (const batch of chunk(players, 1000)) {
    await prisma.player.createMany({ data: batch, skipDuplicates: true });
  }
  const saved = await prisma.player.findMany({
    where: { sourceId: { in: players.map((player) => player.sourceId) } },
    select: { id: true, sourceId: true, name: true },
  });

  // Keep the source's spelling up to date. Only a handful of players ever change.
  const latestName = new Map(players.map((player) => [player.sourceId, player.name]));
  for (const player of saved) {
    const name = latestName.get(player.sourceId);
    if (name && name !== player.name) {
      await prisma.player.update({ where: { id: player.id }, data: { name } });
    }
  }

  return new Map(saved.map((player) => [player.sourceId, player.id]));
}

function matchValues(match: PlannedMatch, playerIds: Map<string, string>) {
  const winnerId = playerIds.get(match.winnerSourceId);
  const loserId = playerIds.get(match.loserSourceId);
  if (!winnerId || !loserId) throw new Error(`No player saved for match ${match.sourceMatchId}`);

  const row: Record<(typeof MATCH_COLUMNS)[number], unknown> = {
    ...match,
    winnerId,
    loserId,
  };
  return Prisma.sql`(${Prisma.join(
    MATCH_COLUMNS.map((column) => {
      if (column === "round") return Prisma.sql`${row.round}::"Round"`;
      if (column === "status") return Prisma.sql`${row.status}::"MatchStatus"`;
      return Prisma.sql`${row[column]}`;
    })
  )})`;
}

async function upsertMatches(matches: PlannedMatch[], playerIds: Map<string, string>) {
  const columns = Prisma.raw(MATCH_COLUMNS.map((column) => `"${column}"`).join(", "));
  const updates = Prisma.raw(
    MATCH_COLUMNS.filter((column) => column !== "sourceMatchId")
      .map((column) => `"${column}" = EXCLUDED."${column}"`)
      .join(", ")
  );

  let written = 0;
  for (const batch of chunk(matches, BATCH_SIZE)) {
    written += await prisma.$executeRaw`
      INSERT INTO "Match" (${columns})
      VALUES ${Prisma.join(batch.map((match) => matchValues(match, playerIds)))}
      ON CONFLICT ("sourceMatchId") DO UPDATE SET ${updates}`;
  }
  return written;
}

async function loadSeason(season: number, matches: NormalizedMatch[]) {
  const plan = planMatches(matches);

  await saveTournaments(plan.tournaments);
  const playerIds = await savePlayers(plan.players);
  const written = await upsertMatches(plan.matches, playerIds);

  // Matches that were in the database for this season but are no longer in the source file.
  const removed = await prisma.match.deleteMany({
    where: { season, sourceMatchId: { notIn: plan.matches.map((match) => match.sourceMatchId) } },
  });

  return { written, removed: removed.count, players: plan.players.length, tournaments: plan.tournaments.length };
}

async function main() {
  const dir = argValue("--dir") ?? "seed-files";
  const seasonArg = argValue("--season");
  const files = listSeasonFiles(dir, seasonArg ? Number(seasonArg) : undefined);
  if (files.length === 0) throw new Error(`No season files (YYYY-atp-season.csv) found in ${dir}`);

  console.log(`Loading ${files.map((file) => file.season).join(", ")} into ${databaseHost()}`);
  for (const file of files) {
    const started = Date.now();
    const matches: NormalizedMatch[] = [];
    let skipped = 0;
    for (const row of readSeasonFile(file.path)) {
      const result = normalizeRow(row);
      if (result.ok) matches.push(result.match);
      else skipped++;
    }

    const result = await loadSeason(file.season, matches);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      `${file.season}: ${result.written} matches written, ${result.removed} removed, ${skipped} rows skipped ` +
        `(${result.players} players, ${result.tournaments} tournaments) in ${seconds}s`
    );
  }

  const [players, tournaments, total] = await Promise.all([prisma.player.count(), prisma.tournament.count(), prisma.match.count()]);
  console.log(`Database now has ${total} matches, ${players} players and ${tournaments} tournaments.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
