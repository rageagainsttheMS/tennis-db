import type { MatchWithPlayers } from "@/types";
import { roundLabel } from "@/types/constants";

type PlayerMatch = Pick<
  MatchWithPlayers,
  "id" | "winnerId" | "loserId" | "status" | "playedAt" | "round" | "season" | "score" | "surface" | "indoor" | "tournamentId" | "tournament" | "winner" | "loser"
>;

const byNewest = <T extends { playedAt: Date | string }>(a: T, b: T) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime();

/** Wins as a whole-number percentage of decided matches (walkovers excluded), or null with none. */
export function winRate(record: { wins: number; losses: number }): number | null {
  const total = record.wins + record.losses;
  return total === 0 ? null : Math.round((record.wins / total) * 100);
}

/** "W"/"L" for the player's last `count` matches played (no walkovers), newest first. */
export function recentForm(matches: PlayerMatch[], playerId: string, count = 15): ("W" | "L")[] {
  return [...matches]
    .filter((match) => match.status !== "WALKOVER")
    .sort(byNewest)
    .slice(0, count)
    .map((match) => (match.winnerId === playerId ? "W" : "L"));
}

/** Finals the player won, newest first. */
export function latestTitles<T extends PlayerMatch>(matches: T[], playerId: string, count = 3): T[] {
  return matches
    .filter((match) => match.round === "F" && match.winnerId === playerId)
    .sort(byNewest)
    .slice(0, count);
}

export type EventOutcome = { kind: "champion" | "runner-up" | "lost" | "none"; label: string | null };

/** How the player's run at one event ended, from their matches there. */
export function eventOutcome(matches: Pick<PlayerMatch, "round" | "winnerId" | "loserId" | "playedAt">[], playerId: string): EventOutcome {
  if (matches.some((match) => match.round === "F" && match.winnerId === playerId)) return { kind: "champion", label: "Champion" };
  if (matches.some((match) => match.round === "F" && match.loserId === playerId)) return { kind: "runner-up", label: "Runner-up" };
  const lastLoss = [...matches].sort(byNewest).find((match) => match.loserId === playerId);
  if (lastLoss) return { kind: "lost", label: `Lost · ${roundLabel(lastLoss.round)}` };
  return { kind: "none", label: null };
}

export interface PlayerEvent<T extends PlayerMatch = PlayerMatch> {
  /** `${tournamentId}-${season}` */
  key: string;
  tournament: T["tournament"];
  season: number;
  surface: string | null;
  indoor: boolean;
  start: Date;
  end: Date;
  /** Newest first. */
  matches: T[];
  outcome: EventOutcome;
}

/** The player's matches grouped into events (one tournament in one season), newest event first. */
export function groupPlayerEvents<T extends PlayerMatch>(matches: T[], playerId: string): PlayerEvent<T>[] {
  const groups = new Map<string, T[]>();
  for (const match of matches) {
    const key = `${match.tournamentId}-${match.season}`;
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }
  return [...groups.entries()]
    .map(([key, group]) => {
      const sorted = [...group].sort(byNewest);
      const latest = sorted[0];
      return {
        key,
        tournament: latest.tournament,
        season: latest.season,
        surface: latest.surface,
        indoor: latest.indoor,
        start: new Date(sorted[sorted.length - 1].playedAt),
        end: new Date(latest.playedAt),
        matches: sorted,
        outcome: eventOutcome(sorted, playerId),
      };
    })
    .sort((a, b) => b.end.getTime() - a.end.getTime());
}
