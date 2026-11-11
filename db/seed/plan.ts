/**
 * Turns normalized matches into the records to write. Pure: no database access, so the
 * loader's decisions can be unit-tested.
 */
import type { NormalizedMatch } from "./normalize";
import type { TournamentLevel } from "./tournaments";

export interface PlannedPlayer {
  sourceId: string;
  name: string;
}

export interface PlannedTournament {
  id: string;
  name: string;
  tournamentType: TournamentLevel;
  surface: string | null;
  indoor: boolean;
  /** The season these details come from. Older loads must not overwrite newer details. */
  season: number;
}

/** A Match row keyed by source player IDs. The loader swaps them for database IDs. */
export interface PlannedMatch {
  sourceMatchId: string;
  season: number;
  playedAt: Date;
  tournamentId: string;
  tournamentDetail: string | null;
  round: string;
  surface: string | null;
  indoor: boolean;
  status: string;
  bestOf: number;
  score: string;
  winnerSourceId: string;
  loserSourceId: string;
  winnerRank: number | null;
  loserRank: number | null;
  winnerRankingPoints: number | null;
  loserRankingPoints: number | null;
  winnerSets: number | null;
  loserSets: number | null;
  winnerAces: number | null;
  loserAces: number | null;
  winnerDoubleFaults: number | null;
  loserDoubleFaults: number | null;
  winnerServicePointsWonPct: number | null;
  loserServicePointsWonPct: number | null;
  winnerReturnPointsWonPct: number | null;
  loserReturnPointsWonPct: number | null;
  winnerBreakPointsWonPct: number | null;
  loserBreakPointsWonPct: number | null;
  winnerBreakPointsSavedPct: number | null;
  loserBreakPointsSavedPct: number | null;
}

export interface SeasonPlan {
  players: PlannedPlayer[];
  tournaments: PlannedTournament[];
  matches: PlannedMatch[];
}

/**
 * Players and tournaments take their details from their most recent match in the input, so a
 * spelling change or a promotion to ATP 500 picks up the latest value.
 */
export function planMatches(matches: NormalizedMatch[]): SeasonPlan {
  const byDate = [...matches].sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  const players = new Map<string, PlannedPlayer>();
  const tournaments = new Map<string, PlannedTournament>();
  const planned: PlannedMatch[] = [];

  for (const match of byDate) {
    const { tournament, winner, loser } = match;

    for (const player of [winner, loser]) {
      players.set(player.sourceId, { sourceId: player.sourceId, name: player.name });
    }

    tournaments.set(tournament.slug, {
      id: tournament.slug,
      name: tournament.name,
      tournamentType: tournament.level,
      surface: match.surface,
      indoor: tournament.indoor,
      season: match.season,
    });

    planned.push({
      sourceMatchId: match.sourceMatchId,
      season: match.season,
      playedAt: match.playedAt,
      tournamentId: tournament.slug,
      tournamentDetail: tournament.detail,
      round: match.round,
      surface: match.surface,
      indoor: tournament.indoor,
      status: match.status,
      bestOf: match.bestOf,
      score: match.score,
      winnerSourceId: winner.sourceId,
      loserSourceId: loser.sourceId,
      winnerRank: winner.rank,
      loserRank: loser.rank,
      winnerRankingPoints: winner.rankingPoints,
      loserRankingPoints: loser.rankingPoints,
      winnerSets: winner.setsWon,
      loserSets: loser.setsWon,
      winnerAces: winner.aces,
      loserAces: loser.aces,
      winnerDoubleFaults: winner.doubleFaults,
      loserDoubleFaults: loser.doubleFaults,
      winnerServicePointsWonPct: winner.servicePointsWonPct,
      loserServicePointsWonPct: loser.servicePointsWonPct,
      winnerReturnPointsWonPct: winner.returnPointsWonPct,
      loserReturnPointsWonPct: loser.returnPointsWonPct,
      winnerBreakPointsWonPct: winner.breakPointsWonPct,
      loserBreakPointsWonPct: loser.breakPointsWonPct,
      winnerBreakPointsSavedPct: winner.breakPointsSavedPct,
      loserBreakPointsSavedPct: loser.breakPointsSavedPct,
    });
  }

  return { players: [...players.values()], tournaments: [...tournaments.values()], matches: planned };
}

/** Splits `items` into arrays of at most `size`. */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size < 1) throw new Error("chunk size must be at least 1");
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}
