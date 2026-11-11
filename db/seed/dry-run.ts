/**
 * Dry run of the tennisdata.app import: converts every row and prints what would be imported
 * and what would be skipped. It reads files only and never connects to the database.
 *
 *   npm run db:seed:dry-run                  all seasons in seed-files/
 *   npm run db:seed:dry-run -- --season 2026
 *   npm run db:seed:dry-run -- --dir path/to/files
 */
import { listSeasonFiles, readSeasonFile } from "./files";
import { normalizeRow, type NormalizedMatch, type SkipReason } from "./normalize";

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

function count<K>(map: Map<K, number>, key: K, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}

function sortedEntries<K>(map: Map<K, number>): [K, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function formatCounts<K>(map: Map<K, number>): string {
  return sortedEntries(map).map(([key, n]) => `${key} ${n}`).join(" · ");
}

function percent(part: number, whole: number): string {
  return whole === 0 ? "n/a" : `${Math.round((part / whole) * 100)}%`;
}

const dir = argValue("--dir") ?? "seed-files";
const seasonArg = argValue("--season");
const files = listSeasonFiles(dir, seasonArg ? Number(seasonArg) : undefined);
if (files.length === 0) {
  console.error(`No season files (YYYY-atp-season.csv) found in ${dir}`);
  process.exit(1);
}

const matches: NormalizedMatch[] = [];
const skippedDetails = new Map<string, number>();
const seenIds = new Set<string>();
let duplicateIds = 0;

console.log("== Rows per season ==");
for (const file of files) {
  const rows = readSeasonFile(file.path);
  const skipped = new Map<SkipReason, number>();
  let imported = 0;

  for (const row of rows) {
    const result = normalizeRow(row);
    if (!result.ok) {
      count(skipped, result.reason);
      // Expected skips need no detail. Anything else is listed so it can be checked.
      if (!["challenger", "exhibition", "qualifying", "excluded-event", "cancelled", "scheduled"].includes(result.reason)) {
        count(skippedDetails, `${result.reason}: ${result.detail ?? "(no detail)"}`);
      }
      continue;
    }
    if (seenIds.has(result.match.sourceMatchId)) duplicateIds++;
    seenIds.add(result.match.sourceMatchId);
    matches.push(result.match);
    imported++;
  }

  console.log(`${file.season}: ${rows.length} rows -> import ${imported}, skip ${rows.length - imported} (${formatCounts(skipped)})`);
}

console.log(`\nTotal to import: ${matches.length} matches. Duplicate match IDs: ${duplicateIds}`);

console.log("\n== Skipped rows that need a look ==");
if (skippedDetails.size === 0) console.log("none");
for (const [detail, n] of sortedEntries(skippedDetails)) console.log(`${n} x ${detail}`);

const byStatus = new Map<string, number>();
const byRound = new Map<string, number>();
const byLevel = new Map<string, number>();
const bySurface = new Map<string, number>();
const byBestOf = new Map<string, number>();
for (const match of matches) {
  count(byStatus, match.status);
  count(byRound, match.round);
  count(byLevel, match.tournament.level);
  count(bySurface, `${match.surface ?? "none"}${match.tournament.indoor ? " (indoor)" : ""}`);
  count(byBestOf, `best of ${match.bestOf}`);
}
console.log("\n== Matches to import ==");
console.log(`Status:  ${formatCounts(byStatus)}`);
console.log(`Round:   ${formatCounts(byRound)}`);
console.log(`Level:   ${formatCounts(byLevel)}`);
console.log(`Surface: ${formatCounts(bySurface)}`);
console.log(`Format:  ${formatCounts(byBestOf)}`);

const played = matches.filter((match) => match.status !== "WALKOVER");
const withRank = played.filter((match) => match.winner.rank !== null && match.loser.rank !== null).length;
const withAces = played.filter((match) => match.winner.aces !== null).length;
const withServe = played.filter((match) => match.winner.servicePointsWonPct !== null).length;
const withScore = played.filter((match) => /\d/.test(match.score)).length;
console.log("\n== Data coverage (matches that were played) ==");
console.log(`Both ranks ${percent(withRank, played.length)} · aces ${percent(withAces, played.length)} · serve % ${percent(withServe, played.length)} · set scores ${percent(withScore, played.length)}`);

// Players
const namesById = new Map<string, Map<string, number>>();
for (const match of matches) {
  for (const player of [match.winner, match.loser]) {
    if (!namesById.has(player.sourceId)) namesById.set(player.sourceId, new Map());
    count(namesById.get(player.sourceId)!, player.name);
  }
}
const idsByName = new Map<string, string[]>();
for (const [id, names] of namesById) {
  for (const name of names.keys()) idsByName.set(name, [...(idsByName.get(name) ?? []), id]);
}
console.log(`\n== Players: ${namesById.size} ==`);
const sharedNames = [...idsByName.entries()].filter(([, ids]) => ids.length > 1);
console.log(`Names used by more than one player ID: ${sharedNames.length}`);
for (const [name, ids] of sharedNames) console.log(`  ${name}: ${ids.join(", ")}`);
const multiNames = [...namesById.entries()].filter(([, names]) => names.size > 1);
console.log(`Player IDs with more than one spelling: ${multiNames.length}`);
for (const [id, names] of multiNames) console.log(`  ${id}: ${[...names.keys()].join(" / ")}`);

// Tournaments
interface TournamentSummary {
  name: string;
  levels: Map<string, Set<number>>;
  seasons: Set<number>;
  matches: number;
  indoor: Set<boolean>;
}
const tournaments = new Map<string, TournamentSummary>();
for (const match of matches) {
  const { slug, name, level, indoor } = match.tournament;
  if (!tournaments.has(slug)) {
    tournaments.set(slug, { name, levels: new Map(), seasons: new Set(), matches: 0, indoor: new Set() });
  }
  const summary = tournaments.get(slug)!;
  if (!summary.levels.has(level)) summary.levels.set(level, new Set());
  summary.levels.get(level)!.add(match.season);
  summary.seasons.add(match.season);
  summary.indoor.add(indoor);
  summary.matches++;
}

function shortSeasons(seasons: Set<number>): string {
  return [...seasons].sort().map((season) => String(season).slice(2)).join(",");
}

console.log(`\n== Tournaments: ${tournaments.size} ==`);
console.log("slug | name | level | seasons | matches | venue");
const levelOrder = ["GS", "ATPM1000", "Finals", "ATP500", "ATP250", "NextGen", "Olympics", "DavisCup", "LaverCup", "TeamCup"];
const rank = (summary: TournamentSummary) => Math.min(...[...summary.levels.keys()].map((level) => levelOrder.indexOf(level)));
for (const [slug, summary] of [...tournaments.entries()].sort((a, b) => rank(a[1]) - rank(b[1]) || a[0].localeCompare(b[0]))) {
  const levels =
    summary.levels.size === 1
      ? [...summary.levels.keys()][0]
      : [...summary.levels.entries()].map(([level, seasons]) => `${level} (${shortSeasons(seasons)})`).join(", ");
  const venue = summary.indoor.size === 2 ? "indoor and outdoor" : summary.indoor.has(true) ? "indoor" : "outdoor";
  console.log(`${slug} | ${summary.name} | ${levels} | ${shortSeasons(summary.seasons)} | ${summary.matches} | ${venue}`);
}
