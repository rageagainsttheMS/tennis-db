import { ROUND_TYPES } from "@/types/constants";

const ROUND_ORDER: string[] = ROUND_TYPES.map((round) => round.value);

/** Matches grouped by round, final first (the order of `ROUND_TYPES`), newest first within a round. */
export function groupByRound<T extends { round: string; playedAt: Date | string }>(matches: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const match of matches) groups.set(match.round, [...(groups.get(match.round) ?? []), match]);
  return [...groups.entries()]
    .map(([round, group]): [string, T[]] => [round, [...group].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())])
    .sort(([a], [b]) => ROUND_ORDER.indexOf(a) - ROUND_ORDER.indexOf(b));
}

/** The season's final, if one was played. */
export function findFinal<T extends { round: string }>(matches: T[]): T | null {
  return matches.find((match) => match.round === "F") ?? null;
}
