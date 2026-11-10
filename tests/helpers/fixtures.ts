import type { Match, Player, Tournament } from "@/types";

/**
 * A match with every stat filled in. The stat values are made up (not the real result) and
 * chosen so the expected percentages are easy to check by hand.
 */
export function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 1,
    tourneyId: "2024-339",
    tourneyName: "Brisbane",
    surface: "Hard",
    drawSize: "32",
    tourneyLevel: "A",
    tourneyDate: "20240101",
    matchNumber: 300,

    winnerId: "105777",
    winnerSeed: "2",
    winnerEntry: null,
    winnerName: "Grigor Dimitrov",
    winnerHand: "R",
    winnerHeight: 191,
    winnerCountry: "BUL",
    winnerAge: 32.6,
    winnerRank: 14,
    winnerRankPoints: 2775,

    loserId: "208029",
    loserSeed: "1",
    loserEntry: null,
    loserName: "Holger Rune",
    loserHand: "R",
    loserHeight: 188,
    loserCountry: "DEN",
    loserAge: 20.6,
    loserRank: 8,
    loserRankPoints: 3660,

    score: "7-6(5) 6-4",
    bestOf: 3,
    round: "F",
    minutes: 98,

    winnerAces: 12,
    winnerDoubleFaults: 2,
    winnerServicePointsPlayed: 80,
    winner1stServeIn: 50,
    winner1stServeWon: 40,
    winner2ndServeWon: 18,
    winnerServeGames: 11,
    winnerBreakPointSaved: 3,
    winnerBreakPointFaced: 4,

    loserAces: 5,
    loserDoubleFaults: 4,
    loserServicePointsPlayed: 70,
    loser1stServeIn: 35,
    loser1stServeWon: 25,
    loser2ndServeWon: 14,
    loserServeGames: 10,
    loserBreakPointSaved: 1,
    loserBreakPointFaced: 2,
    ...overrides,
  };
}

export function makePlayerInput(overrides: Partial<Player> = {}): Player {
  return {
    name: "Grigor Dimitrov",
    nickName: "Baby Fed",
    hand: "RIGHT",
    backHand: "ONEHANDED",
    country: "Bulgaria",
    birthPlace: "Haskovo",
    turnedPro: "2008",
    age: "33",
    rank: 14,
    profile: "Bulgarian player.",
    image: "players/1700000000000-abc.jpg",
    ...overrides,
  };
}

export function makeTournamentInput(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "ignored-by-the-server",
    name: "Brisbane",
    tournamentType: "ATP250",
    image: "tournaments/1700000000000-abc.jpg",
    drawSize: 32,
    description: "Season opener.",
    surface: "Hard",
    ...overrides,
  };
}
