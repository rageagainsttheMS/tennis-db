import type { Player, Tournament } from "@/types";

/** Up to two initials: "Carlos Alcaraz" → "CA", "Alcaraz C." → "AC", "Aguilar Cardozo J." → "AJ". */
export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\s'-]/gu, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0].replace(/^'+/, "").charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

/** The comma-separated nickname field as a list: "Carlitos, VAMOS" → ["Carlitos", "VAMOS"]. */
export function splitNicknames(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

export type SurfaceKey = "hard" | "clay" | "grass";

/** "Hard", "clay", … → "hard". Null for an unknown or missing surface (the Davis Cup). */
export function surfaceKey(surface: string | null | undefined): SurfaceKey | null {
  const key = surface?.trim().toLowerCase();
  return key === "hard" || key === "clay" || key === "grass" ? key : null;
}

/** "Hard (indoor)", "Clay", or null when there's no surface. */
export function surfaceLabel(surface: string | null | undefined, indoor = false): string | null {
  const key = surfaceKey(surface);
  if (!key) return null;
  const name = key.charAt(0).toUpperCase() + key.slice(1);
  return indoor ? `${name} (indoor)` : name;
}

export interface ParsedScore {
  /** Games per set, winner first. */
  sets: { winner: number; loser: number }[];
  /** "RET", "W/O", … when the match didn't finish normally. */
  note: string | null;
}

/** Splits a stored score ("7-6 3-6 6-4", "6-3 2-0 RET", "W/O") into sets and a note. */
export function parseScore(score: string): ParsedScore {
  const sets: ParsedScore["sets"] = [];
  const notes: string[] = [];
  for (const token of score.trim().split(/\s+/).filter(Boolean)) {
    const set = /^(\d+)-(\d+)$/.exec(token);
    if (set) sets.push({ winner: Number(set[1]), loser: Number(set[2]) });
    else notes.push(token);
  }
  return { sets, note: notes.length ? notes.join(" ") : null };
}

/** Whether an admin has entered any bio details for the player. */
export function hasPlayerBio(
  player: Pick<Player, "fullName" | "profile" | "image" | "country" | "nickName" | "birthDate" | "hand" | "backHand" | "birthPlace" | "turnedPro">
): boolean {
  return Boolean(
    player.fullName ||
      player.profile ||
      player.image ||
      player.country ||
      player.nickName ||
      player.birthDate ||
      player.hand ||
      player.backHand ||
      player.birthPlace ||
      player.turnedPro
  );
}

/** Whether an admin has entered a description or image for the tournament. */
export function hasTournamentDetails(tournament: Pick<Tournament, "description" | "image">): boolean {
  return Boolean(tournament.description || tournament.image);
}

const DAY = { day: "numeric", timeZone: "UTC" } as const;
const DAY_MONTH = { day: "numeric", month: "short", timeZone: "UTC" } as const;
const FULL = { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" } as const;

/** "4–8 Nov 2026", "27 Oct – 1 Nov 2026", "29 Dec 2025 – 3 Jan 2026", or one date. */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const from = new Date(start);
  const to = new Date(end);
  const fmt = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString("en-AU", options);
  if (fmt(from, FULL) === fmt(to, FULL)) return fmt(to, FULL);
  if (from.getUTCFullYear() !== to.getUTCFullYear()) return `${fmt(from, FULL)} – ${fmt(to, FULL)}`;
  if (from.getUTCMonth() !== to.getUTCMonth()) return `${fmt(from, DAY_MONTH)} – ${fmt(to, FULL)}`;
  return `${fmt(from, DAY)}–${fmt(to, FULL)}`;
}

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** The A–Z bucket for a name, by its first letter, ignoring accents. "#" when there's no letter. */
export function letterFor(name: string): string {
  const first = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/^[^A-Za-z]+/, "")
    .charAt(0)
    .toUpperCase();
  return LETTERS.includes(first) ? first : "#";
}
