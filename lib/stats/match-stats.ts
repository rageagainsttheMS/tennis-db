import type { Match } from "@/types";

export type MatchSide = "winner" | "loser";

/** One side's statistics. Null means the source has no value (common for walkovers). */
export interface MatchSideStats {
  aces: number | null;
  doubleFaults: number | null;
  /** Whole-number percentages, 0–100. */
  servicePointsWonPct: number | null;
  returnPointsWonPct: number | null;
  breakPointsWonPct: number | null;
  breakPointsSavedPct: number | null;
}

export type MatchStatsSource = Pick<
  Match,
  | "winnerAces" | "loserAces"
  | "winnerDoubleFaults" | "loserDoubleFaults"
  | "winnerServicePointsWonPct" | "loserServicePointsWonPct"
  | "winnerReturnPointsWonPct" | "loserReturnPointsWonPct"
  | "winnerBreakPointsWonPct" | "loserBreakPointsWonPct"
  | "winnerBreakPointsSavedPct" | "loserBreakPointsSavedPct"
>;

export function getSideStats(match: MatchStatsSource, side: MatchSide): MatchSideStats {
  return side === "winner"
    ? {
        aces: match.winnerAces,
        doubleFaults: match.winnerDoubleFaults,
        servicePointsWonPct: match.winnerServicePointsWonPct,
        returnPointsWonPct: match.winnerReturnPointsWonPct,
        breakPointsWonPct: match.winnerBreakPointsWonPct,
        breakPointsSavedPct: match.winnerBreakPointsSavedPct,
      }
    : {
        aces: match.loserAces,
        doubleFaults: match.loserDoubleFaults,
        servicePointsWonPct: match.loserServicePointsWonPct,
        returnPointsWonPct: match.loserReturnPointsWonPct,
        breakPointsWonPct: match.loserBreakPointsWonPct,
        breakPointsSavedPct: match.loserBreakPointsSavedPct,
      };
}

export interface StatRowData {
  label: string;
  winner: string;
  loser: string;
}

const STAT_ROWS: { key: keyof MatchSideStats; label: string; percent: boolean }[] = [
  { key: "aces", label: "Aces", percent: false },
  { key: "doubleFaults", label: "Double faults", percent: false },
  { key: "servicePointsWonPct", label: "Service points won", percent: true },
  { key: "returnPointsWonPct", label: "Return points won", percent: true },
  { key: "breakPointsWonPct", label: "Break points converted", percent: true },
  { key: "breakPointsSavedPct", label: "Break points saved", percent: true },
];

function format(value: number | null, percent: boolean): string {
  if (value === null) return "-";
  return percent ? `${value}%` : String(value);
}

/**
 * The rows the match page shows, formatted for display. A statistic missing for both players
 * is left out, so a walkover shows no table rather than a column of dashes.
 */
export function getStatRows(match: MatchStatsSource): StatRowData[] {
  const winner = getSideStats(match, "winner");
  const loser = getSideStats(match, "loser");
  return STAT_ROWS.filter(({ key }) => winner[key] !== null || loser[key] !== null).map(({ key, label, percent }) => ({
    label,
    winner: format(winner[key], percent),
    loser: format(loser[key], percent),
  }));
}

/** The player's ranking at their most recent match, or null if the source has none. */
export function latestRank(
  matches: Pick<Match, "winnerId" | "loserId" | "winnerRank" | "loserRank" | "playedAt">[],
  playerId: string
): { rank: number; asOf: Date } | null {
  const sorted = [...matches].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  for (const match of sorted) {
    const rank = match.winnerId === playerId ? match.winnerRank : match.loserId === playerId ? match.loserRank : null;
    if (rank !== null) return { rank, asOf: new Date(match.playedAt) };
  }
  return null;
}

/** Wins and losses, for a profile summary. */
export function winLoss(matches: Pick<Match, "winnerId" | "loserId" | "status">[], playerId: string) {
  // A walkover isn't a match played, so it doesn't count towards a record.
  const played = matches.filter((match) => match.status !== "WALKOVER");
  return {
    wins: played.filter((match) => match.winnerId === playerId).length,
    losses: played.filter((match) => match.loserId === playerId).length,
  };
}
