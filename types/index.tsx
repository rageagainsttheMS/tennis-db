import type { Match, Player, Prisma, Tournament } from "@/generated/prisma/client";

export type { Match, Player, Tournament };

/** The few player fields shown next to a match. */
export const PLAYER_SUMMARY_SELECT = { id: true, name: true, fullName: true, image: true } as const;
export type PlayerSummary = Pick<Player, keyof typeof PLAYER_SUMMARY_SELECT>;

/** A match with its tournament and both players, as the match tables and match page use it. */
export const MATCH_INCLUDE = {
  tournament: { select: { id: true, name: true, tournamentType: true } },
  winner: { select: PLAYER_SUMMARY_SELECT },
  loser: { select: PLAYER_SUMMARY_SELECT },
} satisfies Prisma.MatchInclude;

export type MatchWithPlayers = Prisma.MatchGetPayload<{ include: typeof MATCH_INCLUDE }>;

export interface ActionResult {
  success: boolean;
  message: string;
  id?: string;
}
