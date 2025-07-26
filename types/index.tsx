
// Player type based on Prisma Player model
export interface Player {
  name: string;
  nickName?: string | null;
  hand: string;
  backHand: string;
  country: string;
  birthPlace: string;
  turnedPro: string;
  age: string;
  rank: number;
  profile: string;
  image: string;
  playerMatchId?: string | null;
}

export interface Match {
  id: number;
  tourneyId: string | null;
  tourneyName: string;
  surface: string;
  drawSize: string;
  tourneyLevel: string;
  tourneyDate: string;
  matchNumber: number | null;

  winnerId: string | null;
  winnerSeed: string | null;
  winnerEntry: string | null;
  winnerName: string;
  winnerHand: string | null;
  winnerHeight: number | null;
  winnerCountry: string | null;
  winnerAge: number | null;
  winnerRank: number | null;
  winnerRankPoints: number | null;

  loserId: string | null;
  loserSeed: string | null;
  loserEntry: string | null;
  loserName: string | null;
  loserHand: string | null;
  loserHeight: number | null;
  loserCountry: string | null;
  loserAge: number | null;
  loserRank: number | null;
  loserRankPoints: number | null;

  score: string | null;
  bestOf: number;
  round: string;
  minutes: number | null;

  winnerAces: number | null;
  winnerDoubleFaults: number | null;
  winnerServicePointsPlayed: number | null;
  winner1stServeIn: number | null;
  winner1stServeWon: number | null;
  winner2ndServeWon: number | null;
  winnerServeGames: number | null;
  winnerBreakPointSaved: number | null;
  winnerBreakPointFaced: number | null;

  loserAces: number | null;
  loserDoubleFaults: number | null;
  loserServicePointsPlayed: number | null;
  loser1stServeIn: number | null;
  loser1stServeWon: number | null;
  loser2ndServeWon: number | null;
  loserServeGames: number | null;
  loserBreakPointSaved: number | null;
  loserBreakPointFaced: number | null;
}

export interface Tournament {
  id: string;
  name: string;
  tournamentType: "GS" | "ATPM1000" | "ATP500" | "ATP250" | "DavisCup" | "LaverCup";
  image: string;
  drawSize: number;
}

export interface PlayerWithID extends Player {
  id: string;
}

export interface ActionResult {
    success : boolean,
    message : string,
    id? : string
}