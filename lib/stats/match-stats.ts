import type { Match } from "@/types";

export type MatchSide = "winner" | "loser";

export interface ServeStats {
  aces: number;
  doubleFaults: number;
  /** First serves in, as a % of service points played. */
  firstServePercentage: number;
  /** Points won on first serve, as a % of first serves in. */
  firstServeWinPercentage: number;
  /** Points won on second serve, as a % of second serves played. */
  secondServeWinPercentage: number;
  /** "saved/faced", e.g. "3/5". */
  breakPoints: string;
  serviceGames: number;
  /** Points won on serve (first + second serve). Not total points won in the match. */
  servicePointsWon: number;
}

/** Whole-number percentage, or 0 when the denominator is missing or zero. */
export function percentage(part: number | null | undefined, whole: number | null | undefined): number {
  if (!part || !whole || whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/** Serve statistics for one side of a match. Missing stats (common in the source data) count as 0. */
export function getServeStats(match: Match, side: MatchSide): ServeStats {
  const s = side === "winner"
    ? {
        aces: match.winnerAces,
        doubleFaults: match.winnerDoubleFaults,
        servicePoints: match.winnerServicePointsPlayed,
        firstIn: match.winner1stServeIn,
        firstWon: match.winner1stServeWon,
        secondWon: match.winner2ndServeWon,
        serveGames: match.winnerServeGames,
        bpSaved: match.winnerBreakPointSaved,
        bpFaced: match.winnerBreakPointFaced,
      }
    : {
        aces: match.loserAces,
        doubleFaults: match.loserDoubleFaults,
        servicePoints: match.loserServicePointsPlayed,
        firstIn: match.loser1stServeIn,
        firstWon: match.loser1stServeWon,
        secondWon: match.loser2ndServeWon,
        serveGames: match.loserServeGames,
        bpSaved: match.loserBreakPointSaved,
        bpFaced: match.loserBreakPointFaced,
      };

  const secondServesPlayed = (s.servicePoints ?? 0) - (s.firstIn ?? 0);

  return {
    aces: s.aces ?? 0,
    doubleFaults: s.doubleFaults ?? 0,
    firstServePercentage: percentage(s.firstIn, s.servicePoints),
    firstServeWinPercentage: percentage(s.firstWon, s.firstIn),
    secondServeWinPercentage: percentage(s.secondWon, secondServesPlayed),
    breakPoints: `${s.bpSaved ?? 0}/${s.bpFaced ?? 0}`,
    serviceGames: s.serveGames ?? 0,
    servicePointsWon: (s.firstWon ?? 0) + (s.secondWon ?? 0),
  };
}
