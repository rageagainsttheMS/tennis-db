import type { Match, Player, Prisma, Tournament } from "@/generated/prisma/client";

export type { Match, Player, Tournament };

/** The few player fields shown next to a match. */
export const PLAYER_SUMMARY_SELECT = { id: true, name: true, fullName: true, image: true } as const;
export type PlayerSummary = Pick<Player, keyof typeof PLAYER_SUMMARY_SELECT>;

/** The player fields the directory lists, including the ones that tell whether a bio exists. */
export const PLAYER_DIRECTORY_SELECT = {
  id: true,
  name: true,
  fullName: true,
  nickName: true,
  hand: true,
  backHand: true,
  country: true,
  birthPlace: true,
  birthDate: true,
  turnedPro: true,
  profile: true,
  image: true,
} as const;
export type DirectoryPlayer = Pick<Player, keyof typeof PLAYER_DIRECTORY_SELECT>;

/** A match with its tournament and both players, as the match tables and match page use it. */
export const MATCH_INCLUDE = {
  tournament: { select: { id: true, name: true, tournamentType: true, surface: true, indoor: true } },
  winner: { select: PLAYER_SUMMARY_SELECT },
  loser: { select: PLAYER_SUMMARY_SELECT },
} satisfies Prisma.MatchInclude;

export type MatchWithPlayers = Prisma.MatchGetPayload<{ include: typeof MATCH_INCLUDE }>;

export interface ActionResult {
  success: boolean;
  message: string;
  id?: string;
}
