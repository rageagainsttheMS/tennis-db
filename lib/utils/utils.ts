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

export function formatMatchDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
