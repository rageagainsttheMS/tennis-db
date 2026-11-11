/**
 * Converts one row of a tennisdata.app season file into the shape this app stores.
 *
 * The source lists a "home" and an "away" player with `winner_code` saying who won. The app
 * stores a winner and a loser. Everything here is pure (no database, no file access), so it
 * can be unit-tested and run as a dry run.
 */
import { parseTournamentName, type ParsedTournament } from "./tournaments";

/** A CSV row keyed by the source's column names. Empty cells are empty strings. */
export type RawSeedRow = Record<string, string | undefined>;

export type RoundCode =
  | "F"
  | "SF"
  | "QF"
  | "R16"
  | "R32"
  | "R64"
  | "R128"
  | "RR" // round robin / group stage
  | "PO" // knockout stage of a team event
  | "TIE" // Davis Cup and Laver Cup rubbers
  | "BR"; // bronze-medal / third-place match

export type MatchStatus = "COMPLETED" | "RETIRED" | "WALKOVER" | "AWARDED";

export type Surface = "Hard" | "Clay" | "Grass";

export type SkipReason =
  | "challenger"
  | "exhibition"
  | "qualifying"
  | "excluded-event"
  | "cancelled"
  | "scheduled"
  | "no-winner"
  | "unknown-tournament"
  | "unknown-stage"
  | "unknown-round"
  | "unknown-status"
  | "invalid-row";

export interface NormalizedSide {
  /** The source's player ID, stable across seasons. */
  sourceId: string;
  /** Abbreviated, as the source gives it: "Dimitrov G." */
  name: string;
  rank: number | null;
  rankingPoints: number | null;
  setsWon: number | null;
  aces: number | null;
  doubleFaults: number | null;
  /** Percentages are whole numbers from 0 to 100. */
  servicePointsWonPct: number | null;
  returnPointsWonPct: number | null;
  breakPointsWonPct: number | null;
  breakPointsSavedPct: number | null;
}

export interface NormalizedMatch {
  sourceMatchId: string;
  season: number;
  playedAt: Date;
  tournament: ParsedTournament;
  round: RoundCode;
  /** Null for Davis Cup ties, where the source has no surface. */
  surface: Surface | null;
  status: MatchStatus;
  bestOf: 3 | 5;
  /** Winner's games first, e.g. "7-6 3-6 6-4", "6-3 2-0 RET" or "W/O". No tiebreak points. */
  score: string;
  winner: NormalizedSide;
  loser: NormalizedSide;
}

export type NormalizeResult =
  | { ok: true; match: NormalizedMatch }
  | { ok: false; reason: SkipReason; detail?: string };

const TOUR_TYPE_ATP = "1";
const TOUR_TYPE_CHALLENGER = "3";
const TOUR_TYPE_EXHIBITION = "5";

const ROUNDS: Record<string, RoundCode> = {
  Final: "F",
  "Semi-finals": "SF",
  "Quarter-finals": "QF",
  "1/8-finals": "R16",
  "1/16-finals": "R32",
  "1/32-finals": "R64",
  "1/64-finals": "R128",
  "3rd place": "BR",
};

const STATUSES: Record<string, MatchStatus> = {
  FINISHED: "COMPLETED",
  RETIRED: "RETIRED",
  WALKOVER: "WALKOVER",
  AWARDED: "AWARDED",
};

const SURFACES: Record<string, Surface | null> = {
  hard: "Hard",
  clay: "Clay",
  grass: "Grass",
  "no surface": null,
};

const SCORE_SUFFIX: Record<MatchStatus, string> = {
  COMPLETED: "",
  RETIRED: "RET",
  WALKOVER: "W/O",
  AWARDED: "DEF",
};

function cell(row: RawSeedRow, column: string): string {
  return (row[column] ?? "").trim();
}

/** A whole number, or null for an empty or malformed cell. */
function int(row: RawSeedRow, column: string): number | null {
  const value = cell(row, column);
  if (!/^-?\d+$/.test(value)) return null;
  return Number.parseInt(value, 10);
}

function percentage(row: RawSeedRow, column: string): number | null {
  const value = int(row, column);
  return value !== null && value >= 0 && value <= 100 ? value : null;
}

function side(row: RawSeedRow, prefix: "home" | "away"): NormalizedSide {
  return {
    sourceId: cell(row, `${prefix}_id`),
    name: cell(row, `${prefix}_name`),
    rank: int(row, `${prefix}_rank`),
    rankingPoints: int(row, `${prefix}_points`),
    setsWon: int(row, `${prefix}_set_score`),
    aces: int(row, `${prefix}_aces`),
    doubleFaults: int(row, `${prefix}_double_faults`),
    servicePointsWonPct: percentage(row, `${prefix}_service_points_won_perc`),
    returnPointsWonPct: percentage(row, `${prefix}_return_points_won_perc`),
    breakPointsWonPct: percentage(row, `${prefix}_break_points_won_perc`),
    breakPointsSavedPct: percentage(row, `${prefix}_break_points_saved_perc`),
  };
}

function roundFor(rawRound: string, tournament: ParsedTournament): RoundCode | null {
  if (rawRound) return ROUNDS[rawRound] ?? null;

  // The source leaves the round empty for group stages and team ties.
  switch (tournament.level) {
    case "Finals":
    case "NextGen":
      return "RR";
    case "TeamCup":
      return tournament.stage === "PLAYOFFS" ? "PO" : "RR";
    case "DavisCup":
    case "LaverCup":
      return "TIE";
    default:
      return null;
  }
}

function buildScore(row: RawSeedRow, winnerPrefix: "home" | "away", status: MatchStatus): string {
  const loserPrefix = winnerPrefix === "home" ? "away" : "home";
  const sets: string[] = [];
  for (let set = 1; set <= 5; set++) {
    const won = int(row, `${winnerPrefix}_set_${set}_score`);
    const lost = int(row, `${loserPrefix}_set_${set}_score`);
    if (won === null || lost === null) break;
    sets.push(`${won}-${lost}`);
  }
  return [...sets, SCORE_SUFFIX[status]].filter(Boolean).join(" ");
}

export function normalizeRow(row: RawSeedRow): NormalizeResult {
  const tourType = cell(row, "tour_type");
  if (tourType === TOUR_TYPE_CHALLENGER) return { ok: false, reason: "challenger" };
  if (tourType === TOUR_TYPE_EXHIBITION) return { ok: false, reason: "exhibition" };
  if (tourType !== TOUR_TYPE_ATP) return { ok: false, reason: "invalid-row", detail: `tour_type "${tourType}"` };

  const rawStatus = cell(row, "status_extra");
  if (rawStatus === "CANCELED") return { ok: false, reason: "cancelled" };
  if (rawStatus === "SCHEDULED" || cell(row, "status") === "SCHEDULED") return { ok: false, reason: "scheduled" };
  const status = STATUSES[rawStatus];
  if (!status) return { ok: false, reason: "unknown-status", detail: rawStatus };

  const winnerCode = cell(row, "winner_code");
  if (winnerCode !== "1" && winnerCode !== "2") return { ok: false, reason: "no-winner" };

  const sourceMatchId = cell(row, "match_id");
  const season = int(row, "season_year");
  const timestamp = int(row, "date_timestamp");
  const home = side(row, "home");
  const away = side(row, "away");
  if (!sourceMatchId || season === null || timestamp === null || !home.sourceId || !away.sourceId || !home.name || !away.name) {
    return { ok: false, reason: "invalid-row", detail: `match_id "${sourceMatchId}"` };
  }
  if (home.sourceId === away.sourceId) {
    return { ok: false, reason: "invalid-row", detail: `match_id "${sourceMatchId}": same player on both sides` };
  }

  const parsed = parseTournamentName(cell(row, "tournament"), season);
  if (!parsed.ok) return { ok: false, reason: parsed.reason, detail: parsed.detail };
  const tournament = parsed.tournament;
  // Qualifying draws aren't imported. Checked after parsing, because the stage is in the name.
  if (tournament.stage === "QUALIFYING") return { ok: false, reason: "qualifying" };

  const rawRound = cell(row, "round");
  const round = roundFor(rawRound, tournament);
  if (!round) return { ok: false, reason: "unknown-round", detail: `"${rawRound}" in ${cell(row, "tournament")}` };

  const rawSurface = cell(row, "surface");
  if (!(rawSurface in SURFACES)) return { ok: false, reason: "invalid-row", detail: `surface "${rawSurface}"` };

  // Follow winner_code, not the set count: a player who retires can be ahead on sets.
  const winnerPrefix = winnerCode === "1" ? "home" : "away";
  const winner = winnerPrefix === "home" ? home : away;
  const loser = winnerPrefix === "home" ? away : home;

  // Grand Slam main draws are best of five. Anything else where the winner took three sets
  // (e.g. a Davis Cup rubber before 2019) must have been best of five too.
  const bestOf = tournament.level === "GS" || (winner.setsWon ?? 0) >= 3 ? 5 : 3;

  return {
    ok: true,
    match: {
      sourceMatchId,
      season,
      playedAt: new Date(timestamp * 1000),
      tournament,
      round,
      surface: SURFACES[rawSurface],
      status,
      bestOf,
      score: buildScore(row, winnerPrefix, status),
      winner,
      loser,
    },
  };
}
