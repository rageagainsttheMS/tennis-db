import type { Match, MatchWithPlayers, Player, Tournament } from "@/types";

/**
 * A match with every stat filled in. The values are made up (not a real result) and chosen
 * so the expected numbers are easy to check by hand.
 */
export function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 1,
    sourceMatchId: "75191598",
    season: 2024,
    playedAt: new Date("2024-01-07T08:00:00Z"),
    tournamentId: "brisbane",
    tournamentDetail: null,
    round: "F",
    surface: "Hard",
    indoor: false,
    status: "COMPLETED",
    bestOf: 3,
    score: "7-6 6-4",
    winnerId: "player-dimitrov",
    loserId: "player-rune",
    winnerRank: 14,
    loserRank: 8,
    winnerRankingPoints: 2570,
    loserRankingPoints: 3660,
    winnerSets: 2,
    loserSets: 0,
    winnerAces: 12,
    loserAces: 5,
    winnerDoubleFaults: 2,
    loserDoubleFaults: 4,
    winnerServicePointsWonPct: 73,
    loserServicePointsWonPct: 61,
    winnerReturnPointsWonPct: 39,
    loserReturnPointsWonPct: 27,
    winnerBreakPointsWonPct: 50,
    loserBreakPointsWonPct: 0,
    winnerBreakPointsSavedPct: 100,
    loserBreakPointsSavedPct: 50,
    ...overrides,
  };
}

export function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "player-dimitrov",
    sourceId: "111",
    name: "Dimitrov G.",
    fullName: "Grigor Dimitrov",
    nickName: null,
    hand: "RIGHT",
    backHand: "ONEHANDED",
    country: "Bulgaria",
    birthPlace: "Haskovo",
    turnedPro: "2008",
    age: "35",
    profile: "Bulgarian player.",
    image: "players/1700000000000-abc.jpg",
    ...overrides,
  };
}

export function makeMatchWithPlayers(overrides: Partial<Match> = {}): MatchWithPlayers {
  const match = makeMatch(overrides);
  return {
    ...match,
    tournament: { id: match.tournamentId, name: "Brisbane", tournamentType: "ATP250" },
    winner: { id: match.winnerId, name: "Dimitrov G.", fullName: "Grigor Dimitrov", image: null },
    loser: { id: match.loserId, name: "Rune H.", fullName: null, image: null },
  };
}

/** What the admin's bio form sends. */
export function makeBioInput(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Grigor Dimitrov",
    nickName: "Baby Fed",
    hand: "RIGHT",
    backHand: "ONEHANDED",
    country: "Bulgaria",
    birthPlace: "Haskovo",
    turnedPro: "2008",
    age: "35",
    profile: "Bulgarian player.",
    image: "players/1700000000000-abc.jpg",
    ...overrides,
  };
}

export function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "brisbane",
    name: "Brisbane",
    tournamentType: "ATP250",
    surface: "Hard",
    indoor: false,
    drawSize: 32,
    description: "Season opener.",
    image: null,
    ...overrides,
  };
}
