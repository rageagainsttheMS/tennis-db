import type { Player } from "@/types";

export function formatHand(hand: string | null | undefined): string {
  if (!hand) return "-";
  return hand === "LEFT" ? "Left Handed" : "Right Handed";
}

export function formatBackhand(backhand: string | null | undefined): string {
  if (!backhand) return "-";
  return backhand === "ONEHANDED" ? "One Handed Backhand" : "Two Handed Backhand";
}

/** The admin-entered full name if there is one, otherwise the source's abbreviated name. */
export function displayName(player: Pick<Player, "name" | "fullName">): string {
  return player.fullName?.trim() || player.name;
}

/** Whole years from `birthDate` to `today`, using UTC dates. Null when there's no birth date. */
export function ageFromBirthDate(birthDate: Date | string | null | undefined, today: Date = new Date()): number | null {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  let age = today.getUTCFullYear() - born.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < born.getUTCMonth() ||
    (today.getUTCMonth() === born.getUTCMonth() && today.getUTCDate() < born.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** "YYYY-MM-DD" for a date input, or "" when there's no date. */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

export function formatMatchDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
