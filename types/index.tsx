
// Player type based on Prisma Player model
export interface Player {
  name: string;
  hand: string;
  backHand: string;
  country: string;
  age: string;
  rank: number;
  profile: string;
  image: string;
}

export interface PlayerWithID extends Player {
  id: string;
}

export interface ActionResult {
    success : boolean,
    message : string,
    id? : string
}