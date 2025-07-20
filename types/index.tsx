
// Player type based on Prisma Player model
export interface Player {
  name: string;
  hand: string;
  backHand: string;
  country: string;
  birthPlace: string;
  turnedPro: string;
  age: string;
  rank: number;
  profile: string;
  image: string;
  playerMatchId?: string;
}

export interface Match {
  id: number;
  tourneyId?: string;
  tourneyName: string;
  surface: string;
  drawSize: string;
  tourneyLevel: string;
  tourneyDate: string;
  matchNumber?: number;

  winnerId?: string;
  winnerSeed?: string;
  winnerEntry?: string;
  winnerName: string;
  winnerHand?: string;
  winnerHeight?: number;
  winnerCountry?: string;
  winnerAge?: number;
  winnerRank?: number;
  winnerRankPoints?: number;

  loserId?: string;
  loserSeed?: string;
  loserEntry?: string;
  loserName?: string;
  loserHand?: string;
  loserHeight?: number;
  loserCountry?: string;
  loserAge?: number;
  loserRank?: number;
  loserRankPoints?: number;

  score?: string;
  bestOf: number;
  round: string;
  minutes?: number;

  winnerAces?: number;
  winnerDoubleFaults?: number;
  winnerServicePointsPlayed?: number;
  winner1stServeIn?: number;
  winner1stServeWon?: number;
  winner2ndServeWon?: number;
  winnerServeGames?: number;
  winnerBreakPointSaved?: number;
  winnerBreakPointFaced?: number;

  loserAces?: number;
  loserDoubleFaults?: number;
  loserServicePointsPlayed?: number;
  loser1stServeIn?: number;
  loser1stServeWon?: number;
  loser2ndServeWon?: number;
  loserServeGames?: number;
  loserBreakPointSaved?: number;
  loserBreakPointFaced?: number;
}


export interface PlayerWithID extends Player {
  id: string;
}

export interface ActionResult {
    success : boolean,
    message : string,
    id? : string
}